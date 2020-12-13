document.body.classList.add("loading");

function onOpenCvReady() {
  document.body.classList.remove("loading");
}

let imgElement = document.getElementById("imageSrc");
let inputElement = document.getElementById("fileInput");

inputElement.onchange = function () {
  imgElement.src = URL.createObjectURL(event.target.files[0]);
};
let images = new Array();
images = [
  "grayOrImCanvas",
  "histogramGrayOrImCanvas",
  "equalizationImage",
  "equalizationCanvas",
  "NormImage",
  "NormImageCanvas",
];

imgElement.onload = function () {
  let src = cv.imread("imageSrc");
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(src, dst); //еквалізація
  cv.imshow("equalizationImage", dst);
  src.delete();
  dst.delete();
  /*-------------------rgb-----------------------------------*/
  let img = document.getElementById("imageSrc");
  let src_RGB = cv.imread(img);
  let R = new cv.Mat();
  let G = new cv.Mat();
  let B = new cv.Mat();

  // extract channels
  let rgbaPlanes = new cv.MatVector();
  // split the Mat
  cv.split(src_RGB, rgbaPlanes);
  // get RED channel
  R = rgbaPlanes.get(0);
  G = rgbaPlanes.get(1);
  B = rgbaPlanes.get(2);
  cv.imshow("r", R);
  cv.imshow("g", G);
  cv.imshow("b", B);
  /*------------merge-----------*/
  cv.merge(rgbaPlanes, src_RGB);
  cv.imshow("merge_rgb", src_RGB);
  
  R.delete();
  G.delete();
  B.delete();

  src_RGB.delete();
  rgbaPlanes.delete();
  /*----------grayscale image original------------------------*/
  let image = cv.imread(imgElement);
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
  cv.imshow("grayOrImCanvas", image);
  image.delete();
  /*-----------------normalization-----------------------*/
  let src2 = cv.imread(imgElement);
  let dst2 = new cv.Mat();
  let noArray = new cv.Mat();
  cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0);

  cv.normalize(src2, dst2, 0, 255, cv.NORM_MINMAX, -1, noArray);
  cv.imshow("NormImage", dst2);
  src2.delete();
  dst2.delete();
  noArray.delete();
  /*------------------------------------------creating histograms---------------------------------------------------------*/
  for (let i = 0; i < images.length; i++) {
    let srcMat = cv.imread(images[i]);
    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY, 0);
    let srcVec = new cv.MatVector();
    srcVec.push_back(srcMat);
    let accumulate = false;
    let channels = [0];
    let histSize = [256];
    let ranges = [0, 255];
    let hist = new cv.Mat();
    let mask = new cv.Mat();
    let color = new cv.Scalar(255, 255, 255);
    let scale = 2;
    // You can try more different parameters
    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
    let result = cv.minMaxLoc(hist, mask);
    let max = result.maxVal;
    let dst2 = new cv.Mat.zeros(srcMat.rows, histSize[0] * scale, cv.CV_8UC3);
    // draw histogram
    for (let i = 0; i < histSize[0]; i++) {
      let binVal = (hist.data32F[i] * srcMat.rows) / max;
      let point1 = new cv.Point(i * scale, srcMat.rows - 1);
      let point2 = new cv.Point((i + 1) * scale - 1, srcMat.rows - binVal);
      cv.rectangle(dst2, point1, point2, color, cv.FILLED);
    }
    cv.imshow(images[i + 1], dst2);
    srcMat.delete();
    dst2.delete();
    srcVec.delete();
    mask.delete();
    hist.delete();
    i++;
  }
};
