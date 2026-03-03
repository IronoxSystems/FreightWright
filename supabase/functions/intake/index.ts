import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ShippingFrequency = "occasionally" | "monthly" | "weekly" | "multiple_per_week";
type ShipmentProfile = "distributor" | "retail" | "warehouse_transfer" | "mixed" | "other";

type IntakeBody = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;

  shippingFrequency: ShippingFrequency;
  shipmentProfile?: ShipmentProfile;
  primaryLanes: string;
  reason?: string;

  // consent
  consentToContact: boolean; // REQUIRED checkbox
  consentEmail?: boolean; // default true
  consentSms?: boolean; // default false
};

function clean(v?: string) {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsHeaders(origin: string | null) {
  // Allow-list later. For now: keep it permissive and reliable.
  // If you want to echo origin, do it only when origin exists.
  if (origin) {
    return { ...CORS_HEADERS_BASE, "Access-Control-Allow-Origin": origin };
  }
  return { ...CORS_HEADERS_BASE };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  // Always satisfy preflight with CORS headers.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

  try {
    const body = (await req.json()) as IntakeBody;

    const companyName = clean(body.companyName);
    const contactName = clean(body.contactName);
    const email = clean(body.email);
    const phone = clean(body.phone);

    const shippingFrequency = body.shippingFrequency;
    const shipmentProfile = (body.shipmentProfile ?? null) as ShipmentProfile | null;

    const primaryLanes = clean(body.primaryLanes);
    const reason = clean(body.reason);

    const consentToContact = !!body.consentToContact;
    const consentEmail = body.consentEmail ?? true;
    const consentSms = body.consentSms ?? false;

    // Validation (disciplined)
    if (!companyName || !contactName || !email || !primaryLanes || !shippingFrequency) {
      return json({ error: "Missing required fields" }, 400, origin);
    }
    if (!consentToContact) {
      return json({ error: "Consent is required" }, 400, origin);
    }
    // If SMS consent is checked, require phone.
    if (consentSms && !phone) {
      return json({ error: "Phone is required for SMS consent" }, 400, origin);
    }

    const userAgent = req.headers.get("user-agent");
    const referrer = req.headers.get("referer");

    // Hash IP (optional) — store only the hash in DB
    let ipHash: string | null = null;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      null;

    const salt = Deno.env.get("IP_HASH_SALT") ?? "";
    if (ip && salt) ipHash = await sha256Hex(ip + salt);

    // Supabase service role client (Edge runtime)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const payload = {
      companyName,
      contactName,
      email,
      phone,
      shippingFrequency,
      shipmentProfile,
      primaryLanes,
      reason,
      consentToContact,
      consentEmail,
      consentSms,
      submittedAt: new Date().toISOString(),
      referrer,
      userAgent,
    };

    // 1) Create/Upsert lead + create intake submission (via RPC)
    const { data: leadId, error: rpcError } = await supabase.rpc("create_intake_lead", {
      p_org_slug: Deno.env.get("FW_ORG_SLUG") ?? "freightwright",
      p_company_name: companyName,
      p_contact_name: contactName,
      p_email: email,
      p_phone: phone,
      p_shipping_frequency: shippingFrequency,
      p_shipment_profile: shipmentProfile,
      p_primary_lanes: primaryLanes,
      p_reason: reason,
      p_payload: payload,
      p_consent_to_contact: consentToContact,
      p_consent_email: consentEmail,
      p_consent_sms: consentSms,
      p_user_agent: userAgent,
      p_ip_hash: ipHash,
      p_referrer: referrer,
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return json({ error: "Unable to submit review" }, 500, origin);
    }

    // 2) Send confirmation email (Resend)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      // Submission succeeded; email misconfigured
      console.error("Missing RESEND_API_KEY");
      return json({ ok: true, leadId, emailSent: false }, 200, origin);
    }

    const fromName = Deno.env.get("FW_FROM_NAME") ?? "The Freightwright";
    const fromEmail = Deno.env.get("FW_FROM_EMAIL") ?? "foundry@freightwright.com";
    const replyTo = Deno.env.get("FW_REPLY_TO") ?? fromEmail;
    const site = Deno.env.get("FW_SITE") ?? "freightwright.com";

    const subject = "Review received";
    const text = [
      "Review received.",
      "",
      "Your submission is in the queue.",
      "",
      "If you need to add detail or attach documents, reply directly to this email.",
      "",
      "— The Freightwright",
      replyTo,
      site,
    ].join("\n");

    let confirmationProviderId: string | null = null;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        reply_to: replyTo,
        subject,
        text,
      }),
    });

    if (resendResp.ok) {
      const j = await resendResp.json().catch(() => null);
      confirmationProviderId = j?.id ?? null;

      // 3) Update confirmation audit on most recent intake submission for this lead
      if (confirmationProviderId) {
        const { error: updErr } = await supabase.rpc("fw_mark_latest_intake_confirmed", {
          p_lead_id: leadId,
          p_provider_id: confirmationProviderId,
        });
        if (updErr) console.error("confirmation audit update failed:", updErr);
      }
    } else {
      const errText = await resendResp.text();
      console.error("Resend error:", errText);
      // Do not fail intake submission if email fails
    }

    return json({ ok: true, leadId }, 200, origin);
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500, origin);
  }
});