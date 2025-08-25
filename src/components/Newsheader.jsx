import { useT } from "../context/TContext";

export const NewsHeaderBanner = () => {
  const { t } = useT();

  return (
    <section className="bg-gradient-to-r from-blue-200 to-blue-800 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t("news_header.title")}
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          {t("news_header.subtitle")}
        </p>
      </div>
    </section>
  );
};