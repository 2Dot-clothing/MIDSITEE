import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function HomePage() {
  return (
    <>
      {/* Hero — the only fully-built section in Part 1. Everything below it
          is a labelled placeholder for later parts (see comment at bottom). */}
      <section className="border-b border-hairline">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-8">
          <div className="flex flex-col gap-8">
            <Image
              src="/assets/logo.svg"
              alt=""
              width={56}
              height={56}
              className="h-10 w-auto sm:h-14"
              priority
            />
            <p className="text-xs uppercase tracking-widest2 text-slate">
              Performance sportswear
            </p>
            <h1 className="font-display text-6xl uppercase leading-display tracking-tightest sm:text-8xl lg:text-[7.5rem]">
              2
              <span
                className="dot mx-1 h-4 w-4 align-middle sm:h-6 sm:w-6 lg:h-8 lg:w-8"
                aria-hidden
              />
              DOT
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate">
              Built for the run, the lift, and everything between. 2DOT is
              engineered fit — precise where it counts, out of your way
              everywhere else.
            </p>
            <div>
              <Link href="/shop">
                <Button size="lg">Explore Collection</Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end lg:text-right">
            <p className="font-display text-4xl uppercase leading-none tracking-tightest sm:text-5xl">
              Fish
              <br />
              the Fit
            </p>
            <p className="max-w-[16rem] text-sm text-slate lg:text-right">
              A tagline, not a slogan. Every cut is tuned before it ships.
            </p>
          </div>
        </Container>
      </section>

      {/* Placeholder sections — structure only, no data fetching yet.
          Populated with real product/review data in a later part. */}
      <section className="border-b border-hairline">
        <Container className="flex flex-col gap-10 py-16 sm:py-24">
          <SectionHeading
            title="New Arrivals"
            description="The current collection will render here once the product catalog is wired up in Part 2."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex aspect-[3/4] items-center justify-center border border-dashed border-hairline text-xs uppercase tracking-widest2 text-slate"
              >
                Product slot
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-10 py-16 sm:py-24">
          <SectionHeading
            title="What Athletes Say"
            description="Customer reviews will surface here once the reviews system ships."
          />
          <div className="flex aspect-[16/5] items-center justify-center border border-dashed border-hairline text-xs uppercase tracking-widest2 text-slate">
            Reviews placeholder
          </div>
        </Container>
      </section>
    </>
  );
}
