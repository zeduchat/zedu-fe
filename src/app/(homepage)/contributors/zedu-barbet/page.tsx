import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zedu-barbet Contributors",
  description: "Meet the Zedu-barbet team contributing to Zedu.",
};

const members = [
  "Marcus Bennett",
  "Olivia Carter",
  "Daniel Morrison",
  "Sophia Reynolds",
  "Ethan Parker",
  "Maya Thompson",
  "Lucas Anderson",
  "Chloe Mitchell",
  "Nathan Brooks",
  "Amelia Foster",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const ContributorsPage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-6 sm:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
        <h1 className="w-full text-center text-2xl font-semibold leading-tight">
          Team <span className="text-primary-500">Zedu-barbet</span>
        </h1>
        <p className="w-full text-center text-sm text-neutral-600">
          The people who contributed to Zedu.
        </p>
      </section>

      <section className="w-full">
        <div className="grid w-full auto-rows-fr grid-cols-1 items-stretch justify-items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((name) => (
            <div
              key={name}
              className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white p-6 text-center shadow-sm"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl font-semibold text-white">
                {getInitials(name)}
              </div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                Team Zedu-barbet
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContributorsPage;
