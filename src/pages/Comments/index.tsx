import { Component } from 'react';

export default class Comments extends Component {
  componentDidMount(): void {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'RodrigoRVSN/spacetraveling');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', '🔥 comment 🔥');
    script.setAttribute('theme', 'dark-blue');
    anchor.appendChild(script);
  }

  render(): JSX.Element {
    return <div id="inject-comments-for-uterances" />;
  }
}
