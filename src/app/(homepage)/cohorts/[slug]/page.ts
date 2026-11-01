/**
 * Route re-export for public cohort landing pages: the detail page, its
 * metadata generator, and static params for every registry slug.
 */
export {
  default,
  generateMetadata,
  generateStaticParams,
} from "../../_components/cohorts/cohort-detail-page";

/** Only registry slugs are generated; unknown slugs return a real 404. */
export const dynamicParams = false;
