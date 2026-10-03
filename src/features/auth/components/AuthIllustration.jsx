import { MapPin, ShieldCheck, Store } from "lucide-react";

export default function AuthIllustration() {
  return (
    <section className="hidden flex-1 flex-col justify-center px-12 lg:flex">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          HyperLocal<span className="text-green-600">Market</span>
        </h1>

        <h2 className="mt-8 text-5xl font-bold leading-tight text-gray-900">
          Your Neighborhood. <br />
          Everything You Need.
        </h2>

        <p className="mt-5 max-w-md text-lg text-gray-600">
          Buy and sell locally. Support nearby businesses and connect with your
          trusted community.
        </p>
      </div>

      <div className="space-y-6">
        <Feature
          icon={<Store />}
          title="Shop Local"
          text="Find nearby stores, products, and trusted sellers."
        />

        <Feature
          icon={<MapPin />}
          title="Near You"
          text="Discover services and products close to your location."
        />

        <Feature
          icon={<ShieldCheck />}
          title="Safe & Trusted"
          text="Secure transactions with verified local users."
        />
      </div>
    </section>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-2xl bg-green-100 p-3 text-green-700">{icon}</div>

      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}