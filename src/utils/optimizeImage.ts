const optimizeImage = (url: string) =>
  url.replace("upload/", "upload/q_auto,f_auto,w_500,h_500/");

  export default optimizeImage
