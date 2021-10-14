import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  console.log(preview);

  const [hasNextPagination, setHasNextPagination] =
    useState<PostPagination>(postsPagination);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    setAllPosts(
      postsPagination.results.map<Post>(post => {
        return {
          ...post,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: pt,
            }
          ),
        };
      })
    );
  }, []);

  async function loadPagination(): Promise<void> {
    const postResults = await fetch(`${postsPagination.next_page}`).then(
      response => response.json()
    );
    setHasNextPagination(postResults.next_page);
    const newPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: pt,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
    setAllPosts([...allPosts, ...newPosts]);
  }

  return (
    <div className={commonStyles.container}>
      <img src="/logo.png" alt="logo" />

      <main className={styles.content}>
        {allPosts.map(item => (
          <Link href={`/post/${item.uid}`}>
            <a key={item.uid}>
              <h1>{item.data.title}</h1>
              <h2>{item.data.subtitle}</h2>
              <div>
                <FiCalendar color="#DDDDDD" size={20} />
                <span>{item.first_publication_date}</span>
                <FiUser color="#DDDDDD" size={20} />
                <span>{item.data.author}</span>
              </div>
            </a>
          </Link>
        ))}
      </main>

      {postsPagination.next_page && hasNextPagination && (
        <button
          className={styles.loadMore}
          type="button"
          onClick={loadPagination}
        >
          Carregar mais posts
        </button>
      )}
      {!preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination, preview },
    revalidate: 60 * 60 * 24,
  };
};
