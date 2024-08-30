const optimizeImage = (url: string): string =>
  url.includes('upload') ? url.replace("upload/", "upload/q_auto,f_auto,w_500,h_500/") : url

  export default optimizeImage
