import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zedu-barbet Contributors",
  description: "Meet the Zedu-barbet team contributing to Zedu.",
};

const members = [
  { name: "Emmanuel Aklah", github: "Aklah42" },
  { name: "Modupe Adenuga", github: "msnuga3" },
  { name: "Godstime Okoene", github: "GGStyles4" },
  { name: "Kenechukwu Modebelu", github: "KennyMod5" },
  { name: "Eyitene Ejiro", github: "ejiro-eyitene6" },
  { name: "Ubeh-sylvanus Izuchukwu", github: "anonymous-cybe7" },
  { name: "Janet Okedoyin", github: "bimbzzyjane8" },
  { name: "Mgboawaji Williamson", github: "codeWithGodstime9" },
  { name: "Uduma Ifechukwu", github: "UI-Light10" },
  { name: "Abdulsalam Abdulmuiz Olalekan", github: "Iampeace00111" },
  { name: "Jinadu-Paul Oluwatamilore", github: "TammyCodes2912" },
  { name: "Chimdike John", github: "cdJohnEl13" },
  { name: "Adebukola, Jonah", github: "b26-netizen14" },
  { name: "Rabiah Usman", github: "rabiah4u15" },
  { name: "Adisa Abubakr", github: "adisa-ade16" },
  { name: "Adedoyin Ogunsola", github: "adegram" },
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
          {members.map(({ name, github }) => (
            <div
              key={name}
              className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white p-6 text-center shadow-sm"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl font-semibold text-white">
                {getInitials(name)}
              </div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                GitHub: {github}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContributorsPage;
