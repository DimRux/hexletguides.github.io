import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { i18n } from '../../next-i18next.config.js';
import { findPost, getPostAwailableLocales, getPostsList } from '../../api/index.js';
import AmpLayout from '../../components/AmpLayout.jsx';
import AmpPostPageInfo from '../../components/AmpPostPageInfo.jsx';
import MicrometricArticles from '../../components/MicrometricArticles.jsx';
import LanguageMarkup from '../../components/LanguageMarkup.jsx';

const AmpPost = ({ post, languageMarkup }) => {
  if (!post) {
    return null;
  }

  return (
    <AmpLayout title={post.title}>
      <LanguageMarkup languageMarkup={languageMarkup} />
      <MicrometricArticles post={post} />
      <AmpPostPageInfo post={post} />
    </AmpLayout>
  );
};

export const config = {
  amp: true,
};

export const getStaticProps = async ({ locale, params, locales, defaultLocale }) => {
  const post = await findPost(params.name, locale);

  if (!post) {
    return {
      notFound: true,
    };
  }

  if (post.redirect_to) {
    return {
      redirect: {
        permanent: true,
        destination: post.redirect_to,
      },
    };
  }

  const awailableLocales = await getPostAwailableLocales(params.name, locale, locales);

  return {
    props: {
      languageMarkup: { awailableLocales, defaultLocale },
      post,
      ...(await serverSideTranslations(locale, ['common', 'post'])),
    },
  };
};

export const getStaticPaths = async () => {
  const promises = i18n.locales.map(async (locale) => {
    const posts = await getPostsList(locale);

    return posts
      .filter(({ redirect_to }) => !redirect_to)
      .map(({ name }) => ({
        locale,
        params: { name },
      }));
  });

  const allPaths = await Promise.all(promises);
  const paths = allPaths.flat();

  return {
    paths,
    fallback: true,
  };
};

export default AmpPost;
