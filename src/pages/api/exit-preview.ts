/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable consistent-return */

export default async function exit(_, res) {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
}
