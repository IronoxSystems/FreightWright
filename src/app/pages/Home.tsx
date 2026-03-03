import { Link } from "react-router";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6">
      <main className="w-full max-w-xl flex flex-col items-center text-center pt-32 sm:pt-56 pb-24 sm:pb-32">
        {/* Hero */}
        <div className="mb-32 sm:mb-48">
          <h1 className="mb-6 sm:mb-8 max-w-md mx-auto">Freight, handled properly.</h1>
          <p className="text-base mb-12 sm:mb-16 max-w-sm mx-auto leading-relaxed">
            LTL and regional freight management.
          </p>
          <Link
            to="/review"
            className="inline-block px-10 sm:px-12 py-3.5 sm:py-4 bg-[var(--burnished-bronze)] text-[var(--forged-charcoal)] transition-all border-b-2 border-transparent hover:border-[var(--burnished-bronze)]"
          >
            Request Review
          </Link>
        </div>

        {/* Scope */}
        <section className="mb-24 sm:mb-32 w-full max-w-xs">
          <h3 className="mb-8 sm:mb-10">Scope</h3>
          <div className="space-y-3.5 sm:space-y-4 text-sm leading-relaxed">
            <p>LTL shipments</p>
            <p>Distributor freight</p>
            <p>Regional pallet routing</p>
            <p>Appointment-sensitive deliveries</p>
          </div>
        </section>

        {/* Fit */}
        <section className="mb-16 sm:mb-20 w-full max-w-xs">
          <h3 className="mb-8 sm:mb-10">Fit</h3>
          <div className="space-y-3.5 sm:space-y-4 text-sm leading-relaxed">
            <p>Consistent volume.</p>
            <p>Structure over noise.</p>
            <p>Not one-off pallets.</p>
            <p>Not rate shopping.</p>
          </div>
        </section>

        {/* CTA */}
        <Link
          to="/review"
          className="inline-block px-10 sm:px-12 py-3.5 sm:py-4 bg-[var(--burnished-bronze)] text-[var(--forged-charcoal)] transition-all border-b-2 border-transparent hover:border-[var(--burnished-bronze)]"
        >
          Request Review
        </Link>
      </main>

      {/* Footer */}
      <footer className="mt-auto pb-12 sm:pb-16 text-center text-xs text-[var(--muted-text)] space-y-2 tracking-wide">
        <p>Freightwright</p>
        <p>Coastal Georgia</p>
        <p>foundry@freightwright.com</p>
      </footer>
    </div>
  );
}