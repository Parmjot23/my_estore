import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";

const members = [
  { name: "Alice Johnson", role: "CEO", image: "/images/blog/blog-01.jpg" },
  { name: "Bob Smith", role: "CTO", image: "/images/blog/blog-02.jpg" },
  { name: "Carol Lee", role: "Design Lead", image: "/images/blog/blog-03.jpg" },
  { name: "David Kim", role: "Marketing", image: "/images/blog/blog-04.jpg" },
];

const Team = () => (
  <>
    <Breadcrumb title="Our Team" pages={["team"]} />
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((m) => (
            <div
              key={m.name}
              className="p-5 text-center rounded-lg shadow-lg bg-gradient-to-br from-teal-100 to-teal-50 dark:from-gray-800 dark:to-gray-700"
            >
              <Image
                src={m.image}
                alt={m.name}
                width={200}
                height={200}
                className="mx-auto mb-4 rounded-full"
              />
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                {m.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Team;
