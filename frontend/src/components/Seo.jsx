import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const SITE_NAME = "Legxcy";
const SITE_URL = "https://legxcy.uk";
const DEFAULT_IMAGE = `${SITE_URL}/hero.webp`;

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | High-Performance Electric Bikes`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  path: PropTypes.string,
  image: PropTypes.string,
  noindex: PropTypes.bool,
};
