const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const gulpConcat = require('gulp-concat');
const gulpRename = require('gulp-rename');
const babel           = require("gulp-babel");
const gulpBrowserify  = require("gulp-browserify");
const browserify      = require("browserify");
const babelify        = require("babelify");
const source          = require("vinyl-source-stream")
const buffer          = require('vinyl-buffer');
const typeScript      = require('gulp-typescript');
const gulpPostCSS     = require('gulp-postcss');
const plumber         = require('gulp-plumber');
const gulpSourcemap   = require('gulp-sourcemaps');
const preCSS					= require('precss')

/* POST CSS plugin */
const autoprefixer 		= require('autoprefixer');
const cssnano 				= require('cssnano');


const node_modules_path = `${__dirname}/node_modules`;

const es6functionSRC = `${__dirname}/js/es6/main.js`;


require('dotenv').config();

let FRAMEWORK = process.env.FRAMEWORK;
let CSS_FRAMEWORK = process.env.CSS_FRAMEWORK || 'bootstrap'



const middlemanTargets = `${__dirname}/source`;
const spikeTargets = `${__dirname}/assets`;

let jsTarget, scssTarget, esTarget, fontsTarget, imageTarget;

if(FRAMEWORK === 'middleman'){
	jsTarget = `${middlemanTargets}/javascripts/`;
	scssTarget = `${middlemanTargets}/stylesheets/`;
	esTarget = `${middlemanTargets}/javascripts/`;
	fontsTarget = `${middlemanTargets}/fonts/`;
	imageTarget = `${middlemanTargets}/images/`;
}else if(FRAMEWORK == 'wordpress'){
	jsTarget = './javascripts/';
	scssTarget = './stylesheets/';
	esTarget = './javascripts/';
	es6functionSRC = `${__dirname}/js-scss-assets/js/es6/main.js`;
}else if(FRAMEWORK == 'spike'){ 
	jsTarget = `${spikeTargets}/vendor`;
	fontsTarget = `${spikeTargets}/fonts`;
	imageTarget = `${spikeTargets}/img`;
}


if(FRAMEWORK != 'middleman'
&& FRAMEWORK != 'spike'){
	const scssFilePath = './scss/main.scss';
	gulp.task('scss', function(){
			return gulp.src(scssFilePath)
			.pipe(plumber())
			.pipe(gulpSass())
			.pipe(gulp.dest('./css/main.css'));
	});
}


const jquerySRC = `${node_modules_path}/jquery/dist/jquery.min.js`;
const popper = `${node_modules_path}/popper/dist/umd/popper.min.js`;
const bootstrapSRC = `${node_modules_path}/bootstrap/dist/js/bootstrap.min.js`;
const foundationSRC = `${node_modules_path}/foundation-sites/dist/foundation.min.js`;

gulp.task('concatLibs', function(){
		let requiredPlugins = [jquerySRC];
		let outputName = 'bootstrap-libs.js';
		if(CSS_FRAMEWORK==='bootstrap'){
			requiredPlugins = [...requiredPlugins, popper,  bootstrapSRC]
		}else{
			requiredPlugins = [...requiredPlugins,foundationSRC];
			outputName = 'foundation-libs.js';
		}

		return gulp.src(requiredPlugins)
		.pipe(gulpConcat(outputName))
    .pipe(gulp.dest(jsTarget));
});


const slickCarouselSRC = `${node_modules_path}/slick-carousel/slick/slick.min.js`;
const highChartSRC = `${node_modules_path}/highcharts/highcharts.js`;
const jquerySlimScrollSRC = `${node_modules_path}/jquery-slimscroll/jquery.slimscroll.min.js`
const dropzoneJSSRC = `${node_modules_path}/dropzone/dist/min/dropzone.min.js`;


gulp.task('concatCommonLibs', () =>{
	return gulp.src([

	])
	.pipe(plumber())
	.pipe(gulpConcat('common-3rd-libs'))
	.pipe(gulp.dest(jsTarget));
});


gulp.task('concatFunctions', function(){
		return gulp.src([])
		.pipe(plumber())
		.pipe(gulpConcat('functions.js'))
    .pipe(gulp.dest(jsTarget))
})

gulp.task('concatBabelScript', function() {
  return browserify({entries:`${es6functionSRC}`})
    .transform("babelify",{
      presets:["es2015","latest"]
    })
		.bundle()
		.pipe(plumber())
    .pipe(source("main-es6.js"))
    .pipe(gulp.dest(esTarget))
});


const postcssPlugins = [
	require('precss'),
	require('autoprefixer'),
	require('postcss-custom-properties'),
	require('postcss-apply'),
	require('postcss-extend'),
	// require('postcss-calc'),
	require('postcss-custom-media'),
	require('postcss-media-minmax'),
	require('postcss-nesting'),

	// require('postcss-scss'),
	// require('postcss-simple-vars'),
	// require('postcss-color-function')

];
gulp.task('postcss', function(){
	return gulp.src('./postcss/**/*.css')
		.pipe(plumber())
		.pipe(gulpSourcemap.init())
		.pipe(gulpPostCSS(postcssPlugins))
		.pipe(gulpSourcemap.write('.'))
		.pipe(gulp.dest('./source/postcss'));
});


gulp.task('watch', function(){
		gulp.watch('./source/**/*.js',['concatFunctions']);
		if(FRAMEWORK != 'middleman'){
			gulp.watch('./scss/**/*.scss',['sass']);
		}
})




gulp.task('copySlickCarouselFonts', () => {
	const slickCarouselFonts = `${node_modules_path}/slick-carousel/slick/fonts/**`;
	gulp.src(slickCarouselFonts)
	.pipe(gulp.dest(fontsTarget))
});


gulp.task('runBeforeGulp', () => {
	const fontAwesomeFonts = `${node_modules_path}/font-awesome/fonts/**`;
	gulp.src(fontAwesomeFonts)
	.pipe(gulp.dest(fontsTarget))


	const slickCarouselFonts = `${node_modules_path}/slick-carousel/slick/fonts/**`;
	gulp.src(slickCarouselFonts)
	.pipe(gulp.dest(fontsTarget))


	const rateyoCSS = `${node_modules_path}/rateyo/`;
	gulp.src([
		`${rateyoCSS}/min/jquery.rateyo.min.css`
	]).pipe(gulpRename((path) => {
		path.dirname +='/scss';
		path.extname = '.scss'
	})).pipe(gulp.dest(rateyoCSS))


	const dropzoneDIR = `${node_modules_path}/dropzone/`;
	const dropzoneBasicSRC = `${node_modules_path}/dropzone/dist/basic.css`;
	const dropzoneSRC = `${node_modules_path}/dropzone/dist/dropzpne.css`;
	gulp.src(`${dropzoneDIR}/dist/min/*.css`)
		.pipe(gulpRename((path) => {
			path.dirname += '/scss';
			path.extname = '.scss'
		}))
		.pipe(gulp.dest(dropzoneDIR))
})


gulp.task('bootstrapDatePickerTask', () => {
  const bootstrapDatePickerDir = `${node_modules_path}/bootstrap-datepicker`
  const bootstrapDatePickerJSSRC = `${bootstrapDatePickerDir}/dist/js/bootstrap-datepicker.min.js`;
  const bootstrapDatePickerCSSSRC = `${bootstrapDatePickerDir}/dist/css`
  // Save JS File

  gulp.src(bootstrapDatePickerJSSRC)
    .pipe(gulp.dest(jsTarget));


  // Convert CSS TO SASS

  gulp.src(`${bootstrapDatePickerCSSSRC}/*.min.css`)
    .pipe(gulpRename((path) => {
      path.dirname += '/scss';
      path.extname = '.scss';
    })).pipe(gulp.dest(bootstrapDatePickerDir))
})


gulp.task('renameAndCopyDataTable', () => {


  const dataTable = `${node_modules_path}/datatables.net/js/jquery.dataTables.js`;
  const dataTableBootstrap = `${node_modules_path}/datatables.net-bs4/js/dataTables.bootstrap4.js`;
  const dataTableImages = `${node_modules_path}/datatables.net-dt/images/*.*`;
  const dataTableCSSSRC = `${node_modules_path}/datatables.net-dt/`;
  const dataTableBootstrapSRC = `${node_modules_path}/datatables.net-bs4/`;
  const dataTableDestination = `./assets/images`



  gulp.src([
    dataTable, dataTableBootstrap
  ])
    .pipe(gulpConcat('datatable-min.js'))
    .pipe(gulp.dest(jsTarget))
  gulp.src(dataTableImages)
    .pipe(gulp.dest(dataTableDestination))


  gulp.src(`${dataTableCSSSRC}css/jquery.dataTables.css`)
    .pipe(gulpRename((path) => {
      path.dirname += '/scss';
      path.extname = ".scss"
    }))
    .pipe(gulp.dest(dataTableCSSSRC))

  gulp.src(`${dataTableBootstrapSRC}css/dataTables.bootstrap4.css`)
    .pipe(gulpRename((path) => {
      path.dirname += '/scss';
      path.extname = ".scss"
    }))
    .pipe(gulp.dest(dataTableBootstrapSRC))
});


const commonTaskes = ['concatLibs','concatFunctions','concatBabelScript'];
if(FRAMEWORK != 'middleman' && FRAMEWORK != 'spike'){
	commonTaskes.push('scss');
}

gulp.task('default', commonTaskes);