import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={commonStyles.container}>
      <Link href="/">
        <a>
          <img src="/logo.png" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
