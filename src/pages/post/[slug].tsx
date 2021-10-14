/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Link from 'next/link';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../Comments';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const dateFormatted = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: pt,
    }
  );

  const dateEditedFormatted = format(
    new Date(post.last_publication_date),
    'dd MMM yyyy HH:mm',
    {
      locale: pt,
    }
  );

  const totalWords = post.data.content.reduce((acc, content) => {
    acc += content.heading?.split(' ').length;
    const words = content.body.map(word => word.text.split(' ').length);

    words.map(word => (acc += word));

    return acc;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Header />

      <Head>
        <title>{post.data.title} | spacetraveler</title>
      </Head>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <div className={commonStyles.container}>
        <main className={styles.postContent}>
          <h1>{post.data.title}</h1>
          <div>
            <FiCalendar color="#DDDDDD" size={20} />
            <span>{dateFormatted}</span>
            <FiUser color="#DDDDDD" size={20} />
            <span>{post.data.author}</span>
            <FiClock color="#DDDDDD" size={20} />
            <span>{readTime} min</span>
          </div>
          <span>* editado em {dateEditedFormatted}</span>
          {post.data.content.map(content => (
            <>
              <h2 key={content.heading}>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </>
          ))}
        </main>

        <div className={styles.lineDivider} />

        <section className={styles.navigationContainer}>
          <div>
            {navigation?.prevPost?.length > 0 && (
              <>
                <h3>{navigation.prevPost[0].data.title}</h3>
                <Link href={`/post/${navigation.prevPost[0].uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>
          <div>
            {navigation?.nextPost?.length > 0 && (
              <>
                <h3>{navigation.nextPost[0].data.title}</h3>
                <Link href={`/post/${navigation.nextPost[0].uid}`}>
                  <a>Post posterior</a>
                </Link>
              </>
            )}
          </div>
        </section>

        <Comments />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle'],
      pageSize: 10,
    }
  );

  const paths = response.results.map(item => {
    return {
      params: {
        slug: item.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
  };
};
