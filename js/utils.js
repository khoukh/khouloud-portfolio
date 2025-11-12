function preloadImages(imgArray) {
  imgArray.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

function throttle(fn, limit) {
  let waiting = false;
  return function(...args) {
    if (!waiting) {
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => waiting = false, limit);
    }
  };
}
