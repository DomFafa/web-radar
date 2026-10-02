import { melloLayoutStyles } from './melloLayout';
// Mello Coffee 1:1 Replicated Webflow CSS Stylesheet
export const melloStyles = `
html {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  font-family: sans-serif;
}

body {
  margin: 0;
}

article, aside, details, figcaption, figure, footer, header, hgroup, main, menu, nav, section, summary {
  display: block;
}

audio, canvas, progress, video {
  vertical-align: baseline;
  display: inline-block;
}

audio:not([controls]) {
  height: 0;
  display: none;
}

[hidden], template {
  display: none;
}

a {
  background-color: #0000;
}

a:active, a:hover {
  outline: 0;
}

abbr[title] {
  border-bottom: 1px dotted;
}

b, strong {
  font-weight: bold;
}

dfn {
  font-style: italic;
}

h1 {
  margin: .67em 0;
  font-size: 2em;
}

mark {
  color: #000;
  background: #ff0;
}

small {
  font-size: 80%;
}

sub, sup {
  vertical-align: baseline;
  font-size: 75%;
  line-height: 0;
  position: relative;
}

sup {
  top: -.5em;
}

sub {
  bottom: -.25em;
}

img {
  border: 0;
}

svg:not(:root) {
  overflow: hidden;
}

hr {
  box-sizing: content-box;
  height: 0;
}

pre {
  overflow: auto;
}

code, kbd, pre, samp {
  font-family: monospace;
  font-size: 1em;
}

button, input, optgroup, select, textarea {
  color: inherit;
  font: inherit;
  margin: 0;
}

button {
  overflow: visible;
}

button, select {
  text-transform: none;
}

button, html input[type="button"], input[type="reset"] {
  -webkit-appearance: button;
  cursor: pointer;
}

button[disabled], html input[disabled] {
  cursor: default;
}

button::-moz-focus-inner, input::-moz-focus-inner {
  border: 0;
  padding: 0;
}

input {
  line-height: normal;
}

input[type="checkbox"], input[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}

input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button {
  height: auto;
}

input[type="search"] {
  -webkit-appearance: none;
}

input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

legend {
  border: 0;
  padding: 0;
}

textarea {
  overflow: auto;
}

optgroup {
  font-weight: bold;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

td, th {
  padding: 0;
}

@font-face {
  font-family: webflow-icons;
  src: url("data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBiUAAAC8AAAAYGNtYXDpP+a4AAABHAAAAFxnYXNwAAAAEAAAAXgAAAAIZ2x5ZmhS2XEAAAGAAAADHGhlYWQTFw3HAAAEnAAAADZoaGVhCXYFgQAABNQAAAAkaG10eCe4A1oAAAT4AAAAMGxvY2EDtALGAAAFKAAAABptYXhwABAAPgAABUQAAAAgbmFtZSoCsMsAAAVkAAABznBvc3QAAwAAAAAHNAAAACAAAwP4AZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADpAwPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAQAAAAAwACAACAAQAAQAg5gPpA//9//8AAAAAACDmAOkA//3//wAB/+MaBBcIAAMAAQAAAAAAAAAAAAAAAAABAAH//wAPAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEBIAAAAyADgAAFAAAJAQcJARcDIP5AQAGA/oBAAcABwED+gP6AQAABAOAAAALgA4AABQAAEwEXCQEH4AHAQP6AAYBAAcABwED+gP6AQAAAAwDAAOADQALAAA8AHwAvAAABISIGHQEUFjMhMjY9ATQmByEiBh0BFBYzITI2PQE0JgchIgYdARQWMyEyNj0BNCYDIP3ADRMTDQJADRMTDf3ADRMTDQJADRMTDf3ADRMTDQJADRMTAsATDSANExMNIA0TwBMNIA0TEw0gDRPAEw0gDRMTDSANEwAAAAABAJ0AtAOBApUABQAACQIHCQEDJP7r/upcAXEBcgKU/usBFVz+fAGEAAAAAAL//f+9BAMDwwAEAAkAABcBJwEXAwE3AQdpA5ps/GZsbAOabPxmbEMDmmz8ZmwDmvxmbAOabAAAAgAA/8AEAAPAAB0AOwAABSInLgEnJjU0Nz4BNzYzMTIXHgEXFhUUBw4BBwYjNTI3PgE3NjU0Jy4BJyYjMSIHDgEHBhUUFx4BFxYzAgBqXV6LKCgoKIteXWpqXV6LKCgoKIteXWpVSktvICEhIG9LSlVVSktvICEhIG9LSlVAKCiLXl1qal1eiygoKCiLXl1qal1eiygoZiEgb0tKVVVKS28gISEgb0tKVVVKS28gIQABAAABwAIAA8AAEgAAEzQ3PgE3NjMxFSIHDgEHBhUxIwAoKIteXWpVSktvICFmAcBqXV6LKChmISBvS0pVAAAAAgAA/8AFtgPAADIAOgAAARYXHgEXFhUUBw4BBwYHIxUhIicuAScmNTQ3PgE3NjMxOAExNDc+ATc2MzIXHgEXFhcVATMJATMVMzUEjD83NlAXFxYXTjU1PQL8kz01Nk8XFxcXTzY1PSIjd1BQWlJJSXInJw3+mdv+2/7c25MCUQYcHFg5OUA/ODlXHBwIAhcXTzY1PTw1Nk8XF1tQUHcjIhwcYUNDTgL+3QFt/pOTkwABAAAAAQAAmM7nP18PPPUACwQAAAAAANciZKUAAAAA1yJkpf/9/70FtgPDAAAACAACAAAAAAAAAAEAAAPA/8AAAAW3//3//QW2AAEAAAAAAAAAAAAAAAAAAAAMBAAAAAAAAAAAAAAAAgAAAAQAASAEAADgBAAAwAQAAJ0EAP/9BAAAAAQAAAAFtwAAAAAAAAAKABQAHgAyAEYAjACiAL4BFgE2AY4AAAABAAAADAA8AAMAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEADQAAAAEAAAAAAAIABwCWAAEAAAAAAAMADQBIAAEAAAAAAAQADQCrAAEAAAAAAAUACwAnAAEAAAAAAAYADQBvAAEAAAAAAAoAGgDSAAMAAQQJAAEAGgANAAMAAQQJAAIADgCdAAMAAQQJAAMAGgBVAAMAAQQJAAQAGgC4AAMAAQQJAAUAFgAyAAMAAQQJAAYAGgB8AAMAAQQJAAoANADsd2ViZmxvdy1pY29ucwB3AGUAYgBmAGwAbwB3AC0AaQBjAG8AbgBzVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwd2ViZmxvdy1pY29ucwB3AGUAYgBmAGwAbwB3AC0AaQBjAG8AbgBzd2ViZmxvdy1pY29ucwB3AGUAYgBmAGwAbwB3AC0AaQBjAG8AbgBzUmVndWxhcgBSAGUAZwB1AGwAYQByd2ViZmxvdy1pY29ucwB3AGUAYgBmAGwAbwB3AC0AaQBjAG8AbgBzRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==") format("truetype");
  font-weight: normal;
  font-style: normal;
}

[class^="w-icon-"], [class*=" w-icon-"] {
  speak: none;
  font-variant: normal;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  font-family: webflow-icons !important;
}

.w-icon-slider-right:before {
  content: "";
}

.w-icon-slider-left:before {
  content: "";
}

.w-icon-nav-menu:before {
  content: "";
}

.w-icon-arrow-down:before, .w-icon-dropdown-toggle:before {
  content: "";
}

.w-icon-file-upload-remove:before {
  content: "";
}

.w-icon-file-upload-icon:before {
  content: "";
}

* {
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  color: #333;
  background-color: #fff;
  min-height: 100%;
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 20px;
}

img {
  vertical-align: middle;
  max-width: 100%;
  display: inline-block;
}

html.w-mod-touch * {
  background-attachment: scroll !important;
}

.w-block {
  display: block;
}

.w-inline-block {
  max-width: 100%;
  display: inline-block;
}

.w-clearfix:before, .w-clearfix:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-clearfix:after {
  clear: both;
}

.w-hidden {
  display: none;
}

.w-button {
  color: #fff;
  line-height: inherit;
  cursor: pointer;
  background-color: #3898ec;
  border: 0;
  border-radius: 0;
  padding: 9px 15px;
  text-decoration: none;
  display: inline-block;
}

input.w-button {
  -webkit-appearance: button;
}

:where(button.w-popover-trigger) {
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: inherit;
  text-align: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
  background-color: #0000;
  border: 0;
  margin: 0;
  padding: 0;
}

.w-popover {
  position-anchor: none;
}

.w-popover[popover]:not(:popover-open) {
  display: none;
}

html[data-w-dynpage] [data-w-cloak] {
  color: #0000 !important;
}

.w-code-block {
  margin: unset;
}

pre.w-code-block code {
  all: inherit;
}

pre.w-code-block code > span {
  display: block !important;
}

.w-optimization {
  display: contents;
}

.w-webflow-badge, .w-webflow-badge > img {
  box-sizing: unset;
  width: unset;
  height: unset;
  max-height: unset;
  max-width: unset;
  min-height: unset;
  min-width: unset;
  margin: unset;
  padding: unset;
  float: unset;
  clear: unset;
  border: unset;
  border-radius: unset;
  background: unset;
  background-image: unset;
  background-position: unset;
  background-size: unset;
  background-repeat: unset;
  background-origin: unset;
  background-clip: unset;
  background-attachment: unset;
  background-color: unset;
  box-shadow: unset;
  transform: unset;
  direction: unset;
  font-family: unset;
  font-weight: unset;
  color: unset;
  font-size: unset;
  line-height: unset;
  font-style: unset;
  font-variant: unset;
  text-align: unset;
  letter-spacing: unset;
  -webkit-text-decoration: unset;
  text-decoration: unset;
  text-indent: unset;
  text-transform: unset;
  list-style-type: unset;
  text-shadow: unset;
  vertical-align: unset;
  cursor: unset;
  white-space: unset;
  word-break: unset;
  word-spacing: unset;
  word-wrap: unset;
  transition: unset;
}

.w-webflow-badge {
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 0 0 1px #0000001a, 0 1px 3px #0000001a;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 2147483647 !important;
  color: #aaadb0 !important;
  width: auto !important;
  height: auto !important;
  overflow: unset !important;
  background-color: #fff !important;
  border-radius: 3px !important;
  margin: 0 !important;
  padding: 6px !important;
  font-size: 12px !important;
  line-height: 14px !important;
  text-decoration: none !important;
  display: inline-block !important;
  position: fixed !important;
  inset: auto 12px 12px auto !important;
  transform: none !important;
}

.w-webflow-badge > img {
  position: unset;
  visibility: unset !important;
  opacity: 1 !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 10px;
  font-weight: bold;
}

h1 {
  margin-top: 20px;
  font-size: 38px;
  line-height: 44px;
}

h2 {
  margin-top: 20px;
  font-size: 32px;
  line-height: 36px;
}

h3 {
  margin-top: 20px;
  font-size: 24px;
  line-height: 30px;
}

h4 {
  margin-top: 10px;
  font-size: 18px;
  line-height: 24px;
}

h5 {
  margin-top: 10px;
  font-size: 14px;
  line-height: 20px;
}

h6 {
  margin-top: 10px;
  font-size: 12px;
  line-height: 18px;
}

p {
  margin-top: 0;
  margin-bottom: 10px;
}

blockquote {
  border-left: 5px solid #e2e2e2;
  margin: 0 0 10px;
  padding: 10px 20px;
  font-size: 18px;
  line-height: 22px;
}

figure {
  margin: 0 0 10px;
}

figcaption {
  text-align: center;
  margin-top: 5px;
}

ul, ol {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 40px;
}

.w-list-unstyled {
  padding-left: 0;
  list-style: none;
}

.w-embed:before, .w-embed:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-embed:after {
  clear: both;
}

.w-video {
  width: 100%;
  padding: 0;
  position: relative;
}

.w-video iframe, .w-video object, .w-video embed {
  border: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}

button, [type="button"], [type="reset"] {
  cursor: pointer;
  -webkit-appearance: button;
  border: 0;
}

.w-form {
  margin: 0 0 15px;
}

.w-form-done {
  text-align: center;
  background-color: #ddd;
  padding: 20px;
  display: none;
}

.w-form-fail {
  background-color: #ffdede;
  margin-top: 10px;
  padding: 10px;
  display: none;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  display: block;
}

.w-input, .w-select {
  color: #333;
  vertical-align: middle;
  background-color: #fff;
  border: 1px solid #ccc;
  width: 100%;
  height: 38px;
  margin-bottom: 10px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.42857;
  display: block;
}

.w-input::placeholder, .w-select::placeholder {
  color: #999;
}

.w-input:focus, .w-select:focus {
  border-color: #3898ec;
  outline: 0;
}

.w-input[disabled], .w-select[disabled], .w-input[readonly], .w-select[readonly], fieldset[disabled] .w-input, fieldset[disabled] .w-select {
  cursor: not-allowed;
}

.w-input[disabled]:not(.w-input-disabled), .w-select[disabled]:not(.w-input-disabled), .w-input[readonly], .w-select[readonly], fieldset[disabled]:not(.w-input-disabled) .w-input, fieldset[disabled]:not(.w-input-disabled) .w-select {
  background-color: #eee;
}

textarea.w-input, textarea.w-select {
  height: auto;
}

.w-select {
  background-color: #f3f3f3;
}

.w-select[multiple] {
  height: auto;
}

.w-form-label {
  cursor: pointer;
  margin-bottom: 0;
  font-weight: normal;
  display: inline-block;
}

.w-radio {
  margin-bottom: 5px;
  padding-left: 20px;
  display: block;
}

.w-radio:before, .w-radio:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-radio:after {
  clear: both;
}

.w-radio-input {
  float: left;
  margin: 3px 0 0 -20px;
  line-height: normal;
}

.w-file-upload {
  margin-bottom: 10px;
  display: block;
}

.w-file-upload-input {
  opacity: 0;
  z-index: -100;
  width: .1px;
  height: .1px;
  position: absolute;
  overflow: hidden;
}

.w-file-upload-default, .w-file-upload-uploading, .w-file-upload-success {
  color: #333;
  display: inline-block;
}

.w-file-upload-error {
  margin-top: 10px;
  display: block;
}

.w-file-upload-default.w-hidden, .w-file-upload-uploading.w-hidden, .w-file-upload-error.w-hidden, .w-file-upload-success.w-hidden {
  display: none;
}

.w-file-upload-uploading-btn {
  cursor: pointer;
  background-color: #fafafa;
  border: 1px solid #ccc;
  margin: 0;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: normal;
  display: flex;
}

.w-file-upload-file {
  background-color: #fafafa;
  border: 1px solid #ccc;
  flex-grow: 1;
  justify-content: space-between;
  margin: 0;
  padding: 8px 9px 8px 11px;
  display: flex;
}

.w-file-upload-file-name {
  font-size: 14px;
  font-weight: normal;
  display: block;
}

.w-file-remove-link {
  cursor: pointer;
  width: auto;
  height: auto;
  margin-top: 3px;
  margin-left: 10px;
  padding: 3px;
  display: block;
}

.w-icon-file-upload-remove {
  margin: auto;
  font-size: 10px;
}

.w-file-upload-error-msg {
  color: #ea384c;
  padding: 2px 0;
  display: inline-block;
}

.w-file-upload-info {
  padding: 0 12px;
  line-height: 38px;
  display: inline-block;
}

.w-file-upload-label {
  cursor: pointer;
  background-color: #fafafa;
  border: 1px solid #ccc;
  margin: 0;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: normal;
  display: inline-block;
}

.w-icon-file-upload-icon, .w-icon-file-upload-uploading {
  width: 20px;
  margin-right: 8px;
  display: inline-block;
}

.w-icon-file-upload-uploading {
  height: 20px;
}

.w-container {
  max-width: 940px;
  margin-left: auto;
  margin-right: auto;
}

.w-container:before, .w-container:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-container:after {
  clear: both;
}

.w-container .w-row {
  margin-left: -10px;
  margin-right: -10px;
}

.w-row:before, .w-row:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-row:after {
  clear: both;
}

.w-row .w-row {
  margin-left: 0;
  margin-right: 0;
}

.w-col {
  float: left;
  width: 100%;
  min-height: 1px;
  padding-left: 10px;
  padding-right: 10px;
  position: relative;
}

.w-col .w-col {
  padding-left: 0;
  padding-right: 0;
}

.w-col-1 {
  width: 8.33333%;
}

.w-col-2 {
  width: 16.6667%;
}

.w-col-3 {
  width: 25%;
}

.w-col-4 {
  width: 33.3333%;
}

.w-col-5 {
  width: 41.6667%;
}

.w-col-6 {
  width: 50%;
}

.w-col-7 {
  width: 58.3333%;
}

.w-col-8 {
  width: 66.6667%;
}

.w-col-9 {
  width: 75%;
}

.w-col-10 {
  width: 83.3333%;
}

.w-col-11 {
  width: 91.6667%;
}

.w-col-12 {
  width: 100%;
}

.w-hidden-main {
  display: none !important;
}

@media screen and (max-width: 991px) {
  .w-container {
    max-width: 728px;
  }

  .w-hidden-main {
    display: inherit !important;
  }

  .w-hidden-medium {
    display: none !important;
  }

  .w-col-medium-1 {
    width: 8.33333%;
  }

  .w-col-medium-2 {
    width: 16.6667%;
  }

  .w-col-medium-3 {
    width: 25%;
  }

  .w-col-medium-4 {
    width: 33.3333%;
  }

  .w-col-medium-5 {
    width: 41.6667%;
  }

  .w-col-medium-6 {
    width: 50%;
  }

  .w-col-medium-7 {
    width: 58.3333%;
  }

  .w-col-medium-8 {
    width: 66.6667%;
  }

  .w-col-medium-9 {
    width: 75%;
  }

  .w-col-medium-10 {
    width: 83.3333%;
  }

  .w-col-medium-11 {
    width: 91.6667%;
  }

  .w-col-medium-12 {
    width: 100%;
  }

  .w-col-stack {
    width: 100%;
    left: auto;
    right: auto;
  }
}

@media screen and (max-width: 767px) {
  .w-hidden-main, .w-hidden-medium {
    display: inherit !important;
  }

  .w-hidden-small {
    display: none !important;
  }

  .w-row, .w-container .w-row {
    margin-left: 0;
    margin-right: 0;
  }

  .w-col {
    width: 100%;
    left: auto;
    right: auto;
  }

  .w-col-small-1 {
    width: 8.33333%;
  }

  .w-col-small-2 {
    width: 16.6667%;
  }

  .w-col-small-3 {
    width: 25%;
  }

  .w-col-small-4 {
    width: 33.3333%;
  }

  .w-col-small-5 {
    width: 41.6667%;
  }

  .w-col-small-6 {
    width: 50%;
  }

  .w-col-small-7 {
    width: 58.3333%;
  }

  .w-col-small-8 {
    width: 66.6667%;
  }

  .w-col-small-9 {
    width: 75%;
  }

  .w-col-small-10 {
    width: 83.3333%;
  }

  .w-col-small-11 {
    width: 91.6667%;
  }

  .w-col-small-12 {
    width: 100%;
  }
}

@media screen and (max-width: 479px) {
  .w-container {
    max-width: none;
  }

  .w-hidden-main, .w-hidden-medium, .w-hidden-small {
    display: inherit !important;
  }

  .w-hidden-tiny {
    display: none !important;
  }

  .w-col {
    width: 100%;
  }

  .w-col-tiny-1 {
    width: 8.33333%;
  }

  .w-col-tiny-2 {
    width: 16.6667%;
  }

  .w-col-tiny-3 {
    width: 25%;
  }

  .w-col-tiny-4 {
    width: 33.3333%;
  }

  .w-col-tiny-5 {
    width: 41.6667%;
  }

  .w-col-tiny-6 {
    width: 50%;
  }

  .w-col-tiny-7 {
    width: 58.3333%;
  }

  .w-col-tiny-8 {
    width: 66.6667%;
  }

  .w-col-tiny-9 {
    width: 75%;
  }

  .w-col-tiny-10 {
    width: 83.3333%;
  }

  .w-col-tiny-11 {
    width: 91.6667%;
  }

  .w-col-tiny-12 {
    width: 100%;
  }
}

.w-widget {
  position: relative;
}

.w-widget-map {
  width: 100%;
  height: 400px;
}

.w-widget-map label {
  width: auto;
  display: inline;
}

.w-widget-map img {
  max-width: inherit;
}

.w-widget-map .gm-style-iw {
  text-align: center;
}

.w-widget-map .gm-style-iw > button {
  display: none !important;
}

.w-widget-twitter {
  overflow: hidden;
}

.w-widget-twitter-count-shim {
  vertical-align: top;
  text-align: center;
  background: #fff;
  border: 1px solid #758696;
  border-radius: 3px;
  width: 28px;
  height: 20px;
  display: inline-block;
  position: relative;
}

.w-widget-twitter-count-shim * {
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}

.w-widget-twitter-count-shim .w-widget-twitter-count-inner {
  text-align: center;
  color: #999;
  font-family: serif;
  font-size: 15px;
  line-height: 12px;
  position: relative;
}

.w-widget-twitter-count-shim .w-widget-twitter-count-clear {
  display: block;
  position: relative;
}

.w-widget-twitter-count-shim.w--large {
  width: 36px;
  height: 28px;
}

.w-widget-twitter-count-shim.w--large .w-widget-twitter-count-inner {
  font-size: 18px;
  line-height: 18px;
}

.w-widget-twitter-count-shim:not(.w--vertical) {
  margin-left: 5px;
  margin-right: 8px;
}

.w-widget-twitter-count-shim:not(.w--vertical).w--large {
  margin-left: 6px;
}

.w-widget-twitter-count-shim:not(.w--vertical):before, .w-widget-twitter-count-shim:not(.w--vertical):after {
  content: " ";
  pointer-events: none;
  border: solid #0000;
  width: 0;
  height: 0;
  position: absolute;
  top: 50%;
  left: 0;
}

.w-widget-twitter-count-shim:not(.w--vertical):before {
  border-width: 4px;
  border-color: #75869600 #5d6c7b #75869600 #75869600;
  margin-top: -4px;
  margin-left: -9px;
}

.w-widget-twitter-count-shim:not(.w--vertical).w--large:before {
  border-width: 5px;
  margin-top: -5px;
  margin-left: -10px;
}

.w-widget-twitter-count-shim:not(.w--vertical):after {
  border-width: 4px;
  border-color: #fff0 #fff #fff0 #fff0;
  margin-top: -4px;
  margin-left: -8px;
}

.w-widget-twitter-count-shim:not(.w--vertical).w--large:after {
  border-width: 5px;
  margin-top: -5px;
  margin-left: -9px;
}

.w-widget-twitter-count-shim.w--vertical {
  width: 61px;
  height: 33px;
  margin-bottom: 8px;
}

.w-widget-twitter-count-shim.w--vertical:before, .w-widget-twitter-count-shim.w--vertical:after {
  content: " ";
  pointer-events: none;
  border: solid #0000;
  width: 0;
  height: 0;
  position: absolute;
  top: 100%;
  left: 50%;
}

.w-widget-twitter-count-shim.w--vertical:before {
  border-width: 5px;
  border-color: #5d6c7b #75869600 #75869600;
  margin-left: -5px;
}

.w-widget-twitter-count-shim.w--vertical:after {
  border-width: 4px;
  border-color: #fff #fff0 #fff0;
  margin-left: -4px;
}

.w-widget-twitter-count-shim.w--vertical .w-widget-twitter-count-inner {
  font-size: 18px;
  line-height: 22px;
}

.w-widget-twitter-count-shim.w--vertical.w--large {
  width: 76px;
}

.w-background-video {
  color: #fff;
  height: 500px;
  position: relative;
  overflow: hidden;
}

.w-background-video > video {
  object-fit: cover;
  z-index: -100;
  background-position: 50%;
  background-size: cover;
  width: 100%;
  height: 100%;
  margin: auto;
  position: absolute;
  inset: -100%;
}

.w-background-video > video::-webkit-media-controls-start-playback-button {
  -webkit-appearance: none;
  display: none !important;
}

.w-background-video--control {
  background-color: #0000;
  padding: 0;
  position: absolute;
  bottom: 1em;
  right: 1em;
}

.w-background-video--control > [hidden] {
  display: none !important;
}

.w-slider {
  text-align: center;
  clear: both;
  -webkit-tap-highlight-color: #0000;
  tap-highlight-color: #0000;
  background: #ddd;
  height: 300px;
  position: relative;
}

.w-slider-mask {
  z-index: 1;
  white-space: nowrap;
  height: 100%;
  display: block;
  position: relative;
  left: 0;
  right: 0;
  overflow: hidden;
}

.w-slide {
  vertical-align: top;
  white-space: normal;
  text-align: left;
  width: 100%;
  height: 100%;
  display: inline-block;
  position: relative;
}

.w-slider-nav {
  z-index: 2;
  text-align: center;
  -webkit-tap-highlight-color: #0000;
  tap-highlight-color: #0000;
  height: 40px;
  margin: auto;
  padding-top: 10px;
  position: absolute;
  inset: auto 0 0;
}

.w-slider-nav.w-round > div {
  border-radius: 100%;
}

.w-slider-nav.w-num > div {
  width: auto;
  height: auto;
  font-size: inherit;
  line-height: inherit;
  padding: .2em .5em;
}

.w-slider-nav.w-shadow > div {
  box-shadow: 0 0 3px #3336;
}

.w-slider-nav-invert {
  color: #fff;
}

.w-slider-nav-invert > div {
  background-color: #2226;
}

.w-slider-nav-invert > div.w-active {
  background-color: #222;
}

.w-slider-dot {
  cursor: pointer;
  background-color: #fff6;
  width: 1em;
  height: 1em;
  margin: 0 3px .5em;
  transition: background-color .1s, color .1s;
  display: inline-block;
  position: relative;
}

.w-slider-dot.w-active {
  background-color: #fff;
}

.w-slider-dot:focus {
  outline: none;
  box-shadow: 0 0 0 2px #fff;
}

.w-slider-dot:focus.w-active {
  box-shadow: none;
}

.w-slider-arrow-left, .w-slider-arrow-right {
  cursor: pointer;
  color: #fff;
  -webkit-tap-highlight-color: #0000;
  tap-highlight-color: #0000;
  -webkit-user-select: none;
  user-select: none;
  width: 80px;
  margin: auto;
  font-size: 40px;
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.w-slider-arrow-left [class^="w-icon-"], .w-slider-arrow-right [class^="w-icon-"], .w-slider-arrow-left [class*=" w-icon-"], .w-slider-arrow-right [class*=" w-icon-"] {
  position: absolute;
}

.w-slider-arrow-left:focus, .w-slider-arrow-right:focus {
  outline: 0;
}

.w-slider-arrow-left {
  z-index: 3;
  right: auto;
}

.w-slider-arrow-right {
  z-index: 4;
  left: auto;
}

.w-icon-slider-left, .w-icon-slider-right {
  width: 1em;
  height: 1em;
  margin: auto;
  inset: 0;
}

.w-slider-aria-label {
  clip: rect(0 0 0 0);
  border: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  position: absolute;
  overflow: hidden;
}

.w-slider-force-show {
  display: block !important;
}

.w-dropdown {
  text-align: left;
  z-index: 900;
  margin-left: auto;
  margin-right: auto;
  display: inline-block;
  position: relative;
}

.w-dropdown-btn, .w-dropdown-toggle, .w-dropdown-link {
  vertical-align: top;
  color: #222;
  text-align: left;
  white-space: nowrap;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  text-decoration: none;
  position: relative;
}

.w-dropdown-toggle {
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  padding-right: 40px;
  display: inline-block;
}

.w-dropdown-toggle:focus {
  outline: 0;
}

.w-icon-dropdown-toggle {
  width: 1em;
  height: 1em;
  margin: auto 20px auto auto;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
}

.w-dropdown-list {
  background: #ddd;
  min-width: 100%;
  display: none;
  position: absolute;
}

.w-dropdown-list.w--open {
  display: block;
}

.w-dropdown-link {
  color: #222;
  padding: 10px 20px;
  display: block;
}

.w-dropdown-link.w--current {
  color: #0082f3;
}

.w-dropdown-link:focus {
  outline: 0;
}

.w-lightbox-backdrop {
  cursor: auto;
  letter-spacing: normal;
  text-indent: 0;
  text-shadow: none;
  text-transform: none;
  visibility: visible;
  white-space: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  color: #fff;
  text-align: center;
  z-index: 2000;
  opacity: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -webkit-tap-highlight-color: transparent;
  background: #000000e6;
  outline: 0;
  font-family: Helvetica Neue, Helvetica, Ubuntu, Segoe UI, Verdana, sans-serif;
  font-size: 17px;
  font-style: normal;
  font-weight: 300;
  line-height: 1.2;
  list-style: disc;
  position: fixed;
  inset: 0;
  -webkit-transform: translate(0);
}

.w-lightbox-backdrop, .w-lightbox-container {
  -webkit-overflow-scrolling: touch;
  height: 100%;
  overflow: auto;
}

.w-lightbox-content {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.w-lightbox-view {
  opacity: 0;
  width: 100vw;
  height: 100vh;
  position: absolute;
}

.w-lightbox-view:before {
  content: "";
  height: 100vh;
}

.w-lightbox-group, .w-lightbox-group .w-lightbox-view, .w-lightbox-group .w-lightbox-view:before {
  height: 86vh;
}

.w-lightbox-frame, .w-lightbox-view:before {
  vertical-align: middle;
  display: inline-block;
}

.w-lightbox-figure {
  margin: 0;
  position: relative;
}

.w-lightbox-group .w-lightbox-figure {
  cursor: pointer;
}

.w-lightbox-img {
  width: auto;
  max-width: none;
  height: auto;
}

.w-lightbox-image {
  float: none;
  max-width: 100vw;
  max-height: 100vh;
  display: block;
}

.w-lightbox-group .w-lightbox-image {
  max-height: 86vh;
}

.w-lightbox-caption {
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #0006;
  padding: .5em 1em;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}

.w-lightbox-embed {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.w-lightbox-control {
  cursor: pointer;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 24px;
  width: 4em;
  transition: all .3s;
  position: absolute;
  top: 0;
}

.w-lightbox-left {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0yMCAwIDI0IDQwIiB3aWR0aD0iMjQiIGhlaWdodD0iNDAiPjxnIHRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0ibTAgMGg1djIzaDIzdjVoLTI4eiIgb3BhY2l0eT0iLjQiLz48cGF0aCBkPSJtMSAxaDN2MjNoMjN2M2gtMjZ6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==");
  display: none;
  bottom: 0;
  left: 0;
}

.w-lightbox-right {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii00IDAgMjQgNDAiIHdpZHRoPSIyNCIgaGVpZ2h0PSI0MCI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJtMC0waDI4djI4aC01di0yM2gtMjN6IiBvcGFjaXR5PSIuNCIvPjxwYXRoIGQ9Im0xIDFoMjZ2MjZoLTN2LTIzaC0yM3oiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+");
  display: none;
  bottom: 0;
  right: 0;
}

.w-lightbox-close {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii00IDAgMTggMTciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxNyI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJtMCAwaDd2LTdoNXY3aDd2NWgtN3Y3aC01di03aC03eiIgb3BhY2l0eT0iLjQiLz48cGF0aCBkPSJtMSAxaDd2LTdoM3Y3aDd2M2gtN3Y3aC0zdi03aC03eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=");
  background-size: 18px;
  height: 2.6em;
  right: 0;
}

.w-lightbox-strip {
  white-space: nowrap;
  padding: 0 1vh;
  line-height: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto hidden;
}

.w-lightbox-item {
  box-sizing: content-box;
  cursor: pointer;
  width: 10vh;
  padding: 2vh 1vh;
  display: inline-block;
  -webkit-transform: translate3d(0, 0, 0);
}

.w-lightbox-active {
  opacity: .3;
}

.w-lightbox-thumbnail {
  background: #222;
  height: 10vh;
  position: relative;
  overflow: hidden;
}

.w-lightbox-thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
}

.w-lightbox-thumbnail .w-lightbox-tall {
  width: 100%;
  top: 50%;
  transform: translate(0, -50%);
}

.w-lightbox-thumbnail .w-lightbox-wide {
  height: 100%;
  left: 50%;
  transform: translate(-50%);
}

.w-lightbox-spinner {
  box-sizing: border-box;
  border: 5px solid #0006;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-top: -20px;
  margin-left: -20px;
  animation: .8s linear infinite spin;
  position: absolute;
  top: 50%;
  left: 50%;
}

.w-lightbox-spinner:after {
  content: "";
  border: 3px solid #0000;
  border-bottom-color: #fff;
  border-radius: 50%;
  position: absolute;
  inset: -4px;
}

.w-lightbox-hide {
  display: none;
}

.w-lightbox-noscroll {
  overflow: hidden;
}

@media (min-width: 768px) {
  .w-lightbox-content {
    height: 96vh;
    margin-top: 2vh;
  }

  .w-lightbox-view, .w-lightbox-view:before {
    height: 96vh;
  }

  .w-lightbox-group, .w-lightbox-group .w-lightbox-view, .w-lightbox-group .w-lightbox-view:before {
    height: 84vh;
  }

  .w-lightbox-image {
    max-width: 96vw;
    max-height: 96vh;
  }

  .w-lightbox-group .w-lightbox-image {
    max-width: 82.3vw;
    max-height: 84vh;
  }

  .w-lightbox-left, .w-lightbox-right {
    opacity: .5;
    display: block;
  }

  .w-lightbox-close {
    opacity: .8;
  }

  .w-lightbox-control:hover {
    opacity: 1;
  }
}

.w-lightbox-inactive, .w-lightbox-inactive:hover {
  opacity: 0;
}

.w-richtext:before, .w-richtext:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-richtext:after {
  clear: both;
}

.w-richtext[contenteditable="true"]:before, .w-richtext[contenteditable="true"]:after {
  white-space: initial;
}

.w-richtext ol, .w-richtext ul {
  overflow: hidden;
}

.w-richtext .w-richtext-figure-selected.w-richtext-figure-type-video div:after, .w-richtext .w-richtext-figure-selected[data-rt-type="video"] div:after, .w-richtext .w-richtext-figure-selected.w-richtext-figure-type-image div, .w-richtext .w-richtext-figure-selected[data-rt-type="image"] div {
  outline: 2px solid #2895f7;
}

.w-richtext figure.w-richtext-figure-type-video > div:after, .w-richtext figure[data-rt-type="video"] > div:after {
  content: "";
  display: none;
  position: absolute;
  inset: 0;
}

.w-richtext figure {
  max-width: 60%;
  position: relative;
}

.w-richtext figure > div:before {
  cursor: default !important;
}

.w-richtext figure img {
  width: 100%;
}

.w-richtext figure figcaption.w-richtext-figcaption-placeholder {
  opacity: .6;
}

.w-richtext figure div {
  color: #0000;
  font-size: 0;
}

.w-richtext figure.w-richtext-figure-type-image, .w-richtext figure[data-rt-type="image"] {
  display: table;
}

.w-richtext figure.w-richtext-figure-type-image > div, .w-richtext figure[data-rt-type="image"] > div {
  display: inline-block;
}

.w-richtext figure.w-richtext-figure-type-image > figcaption, .w-richtext figure[data-rt-type="image"] > figcaption {
  caption-side: bottom;
  display: table-caption;
}

.w-richtext figure.w-richtext-figure-type-video, .w-richtext figure[data-rt-type="video"] {
  width: 60%;
  height: 0;
}

.w-richtext figure.w-richtext-figure-type-video iframe, .w-richtext figure[data-rt-type="video"] iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.w-richtext figure.w-richtext-figure-type-video > div, .w-richtext figure[data-rt-type="video"] > div {
  width: 100%;
}

.w-richtext figure.w-richtext-align-center {
  clear: both;
  margin-left: auto;
  margin-right: auto;
}

.w-richtext figure.w-richtext-align-center.w-richtext-figure-type-image > div, .w-richtext figure.w-richtext-align-center[data-rt-type="image"] > div {
  max-width: 100%;
}

.w-richtext figure.w-richtext-align-normal {
  clear: both;
}

.w-richtext figure.w-richtext-align-fullwidth {
  text-align: center;
  clear: both;
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.w-richtext figure.w-richtext-align-fullwidth > div {
  padding-bottom: inherit;
  display: inline-block;
}

.w-richtext figure.w-richtext-align-fullwidth > figcaption {
  display: block;
}

.w-richtext figure.w-richtext-align-floatleft {
  float: left;
  clear: none;
  margin-right: 15px;
}

.w-richtext figure.w-richtext-align-floatright {
  float: right;
  clear: none;
  margin-left: 15px;
}

.w-nav {
  z-index: 1000;
  background: #ddd;
  position: relative;
}

.w-nav:before, .w-nav:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-nav:after {
  clear: both;
}

.w-nav-brand {
  float: left;
  color: #333;
  text-decoration: none;
  position: relative;
}

.w-nav-link {
  vertical-align: top;
  color: #222;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  text-decoration: none;
  display: inline-block;
  position: relative;
}

.w-nav-link.w--current {
  color: #0082f3;
}

.w-nav-menu {
  float: right;
  position: relative;
}

[data-nav-menu-open] {
  text-align: center;
  background: #c8c8c8;
  min-width: 200px;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  overflow: visible;
  display: block !important;
}

.w--nav-link-open {
  display: block;
  position: relative;
}

.w-nav-overlay {
  width: 100%;
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  overflow: hidden;
}

.w-nav-overlay [data-nav-menu-open] {
  top: 0;
}

.w-nav[data-animation="over-left"] .w-nav-overlay {
  width: auto;
}

.w-nav[data-animation="over-left"] .w-nav-overlay, .w-nav[data-animation="over-left"] [data-nav-menu-open] {
  z-index: 1;
  top: 0;
  right: auto;
}

.w-nav[data-animation="over-right"] .w-nav-overlay {
  width: auto;
}

.w-nav[data-animation="over-right"] .w-nav-overlay, .w-nav[data-animation="over-right"] [data-nav-menu-open] {
  z-index: 1;
  top: 0;
  left: auto;
}

.w-nav-button {
  float: right;
  cursor: pointer;
  -webkit-tap-highlight-color: #0000;
  tap-highlight-color: #0000;
  -webkit-user-select: none;
  user-select: none;
  padding: 18px;
  font-size: 24px;
  display: none;
  position: relative;
}

.w-nav-button:focus {
  outline: 0;
}

.w-nav-button.w--open {
  color: #fff;
  background-color: #c8c8c8;
}

.w-nav[data-collapse="all"] .w-nav-menu {
  display: none;
}

.w-nav[data-collapse="all"] .w-nav-button, .w--nav-dropdown-open, .w--nav-dropdown-toggle-open {
  display: block;
}

.w--nav-dropdown-list-open {
  position: static;
}

@media screen and (max-width: 991px) {
  .w-nav[data-collapse="medium"] .w-nav-menu {
    display: none;
  }

  .w-nav[data-collapse="medium"] .w-nav-button {
    display: block;
  }
}

@media screen and (max-width: 767px) {
  .w-nav[data-collapse="small"] .w-nav-menu {
    display: none;
  }

  .w-nav[data-collapse="small"] .w-nav-button {
    display: block;
  }

  .w-nav-brand {
    padding-left: 10px;
  }
}

@media screen and (max-width: 479px) {
  .w-nav[data-collapse="tiny"] .w-nav-menu {
    display: none;
  }

  .w-nav[data-collapse="tiny"] .w-nav-button {
    display: block;
  }
}

.w-tabs {
  position: relative;
}

.w-tabs:before, .w-tabs:after {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}

.w-tabs:after {
  clear: both;
}

.w-tab-menu {
  position: relative;
}

.w-tab-link {
  vertical-align: top;
  text-align: left;
  cursor: pointer;
  color: #222;
  background-color: #ddd;
  padding: 9px 30px;
  text-decoration: none;
  display: inline-block;
  position: relative;
}

.w-tab-link.w--current {
  background-color: #c8c8c8;
}

.w-tab-link:focus {
  outline: 0;
}

.w-tab-content {
  display: block;
  position: relative;
  overflow: hidden;
}

.w-tab-pane {
  display: none;
  position: relative;
}

.w--tab-active {
  display: block;
}

@media screen and (max-width: 479px) {
  .w-tab-link {
    display: block;
  }
}

.w-ix-emptyfix:after {
  content: "";
}

@keyframes spin {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.w-dyn-empty {
  background-color: #ddd;
  padding: 10px;
}

.w-dyn-hide, .w-dyn-bind-empty, .w-condition-invisible {
  display: none !important;
}

.wf-layout-layout {
  display: grid;
}

:root {
  --white: #e9ebdf;
  --_fonts---font-family--inter: Inter, sans-serif;
  --black: #284010;
  --_fonts---font-size--body-l: 18px;
  --_fonts---line-height--l: 144%;
  --_fonts---font-weight--medium: 500;
  --_fonts---letter-spacing--m: -.01em;
  --_fonts---font-family--londrina-solid: "Londrina Solid", sans-serif;
  --_fonts---font-size--h1: 104px;
  --_fonts---line-height--s: 100%;
  --_fonts---font-weight--regular: 400;
  --_fonts---font-size--h2: 80px;
  --_fonts---font-size--h3-l: 40px;
  --_fonts---font-size--h4: 24px;
  --_fonts---font-size--h5: 20px;
  --_fonts---font-size--h6: 18px;
  --accent: #78bf30;
  --black-opacity--80: #284010cc;
  --_fonts---font-size--body-m: 14px;
  --_fonts---font-size--logo: 48px;
  --_fonts---font-size--emphasis-l: 18px;
  --_fonts---font-weight--bold: 700;
  --_fonts---letter-spacing--s: -.02em;
  --_sizes---small-radius: 12px;
  --_sizes---medium-radius: 20px;
  --black-opacity--10: #2840101a;
  --white-opacity--20: #e9ebdf33;
  --white-opacity--10: #e9ebdf1a;
  --_fonts---font-size--display-s: 24px;
  --_fonts---font-size--emphasis-m: 14px;
  --_fonts---font-size--body-s: 10px;
  --_fonts---font-family--gochi-hand: "Gochi Hand", sans-serif;
  --_fonts---font-size--handwritten-l: 21px;
  --_fonts---line-height--m: 104%;
  --_fonts---letter-spacing--l: 0em;
  --_sizes---main-radius: 24px;
  --_fonts---font-size--h3-s: 28px;
  --_fonts---font-size--handwritten-s: 16px;
  --_fonts---font-size--display-l: 264px;
  --_fonts---font-size--display-m: 60px;
  --white-opacity--60: #e9ebdf99;
}

.w-layout-blockcontainer {
  max-width: 940px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.w-layout-grid {
  grid-row-gap: 16px;
  grid-column-gap: 16px;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr 1fr;
  grid-auto-columns: 1fr;
  display: grid;
}

@media screen and (max-width: 991px) {
  .w-layout-blockcontainer {
    max-width: 728px;
  }
}

@media screen and (max-width: 767px) {
  .w-layout-blockcontainer {
    max-width: none;
  }
}

body {
  background-color: var(--white);
  font-family: var(--_fonts---font-family--inter);
  color: var(--black);
  font-size: var(--_fonts---font-size--body-l);
  line-height: var(--_fonts---line-height--l);
  font-weight: var(--_fonts---font-weight--medium);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

h1 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h1);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

h2 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h2);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

h3 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h3-l);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

h4 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h4);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

h5 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h5);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

h6 {
  width: 100%;
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h6);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-top: 0;
  margin-bottom: 0;
}

p {
  width: 100%;
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--body-l);
  line-height: var(--_fonts---line-height--l);
  font-weight: var(--_fonts---font-weight--medium);
  letter-spacing: var(--_fonts---letter-spacing--m);
  margin-bottom: 0;
}

a {
  color: var(--black);
  text-decoration: none;
}

img {
  object-fit: cover;
  -webkit-user-select: none;
  user-select: none;
}

.header {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  flex-direction: column;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.info-bar {
  background-color: var(--accent);
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  overflow: hidden;
}

.info-bar-content {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.info-bar-content.second {
  display: none;
}

.menu {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.menu-content {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.logo {
  color: var(--black);
  justify-content: center;
  align-items: center;
  transition: color .3s;
}

.logo:hover {
  color: var(--black-opacity--80);
}

.menu-links {
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.menu-link {
  justify-content: center;
  align-items: center;
  padding: 8px 10px 10px;
  position: relative;
}

.container {
  flex-flow: column;
  width: 100%;
  max-width: 1328px;
  padding-left: 64px;
  padding-right: 64px;
  display: flex;
}

.container.fill {
  flex: 1;
}

.body-m {
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--body-m);
  line-height: var(--_fonts---line-height--l);
  font-weight: var(--_fonts---font-weight--medium);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.body-m.block-description {
  max-width: 360px;
}

.body-m.block-description.small {
  max-width: 264px;
}

.body-m.volume-text {
  text-align: right;
  width: 52px;
}

.body-m.volume-text.opacity {
  color: var(--black-opacity--80);
}

.body-m.align-center {
  text-align: center;
}

.body-m.align-center.vertical {
  writing-mode: vertical-rl;
  height: 144px;
  transform: rotate(180deg);
}

.body-m.opacity {
  color: var(--black-opacity--80);
}

.icon {
  aspect-ratio: 1;
}

.icon.info-bar-icon {
  width: 12px;
}

.icon.info-bar-icon.hidden {
  display: none;
}

.icon.slider-icon {
  width: 20px;
}

.icon.slider-icon.abs {
  opacity: 0;
  position: absolute;
}

.icon.f-link-icon {
  width: 18px;
}

.icon.licenses-block-icon {
  opacity: 0;
  width: 24px;
}

.logo-font {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--logo);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.emphasis-l {
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--emphasis-l);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--bold);
  letter-spacing: var(--_fonts---letter-spacing--s);
}

.link-background {
  z-index: -1;
  border-radius: var(--_sizes---small-radius);
  background-color: var(--accent);
  opacity: 0;
  position: absolute;
  inset: 0%;
  transform: scale(0);
}

.hero {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  min-height: 760px;
  max-height: 1200px;
  padding-top: 240px;
  display: flex;
  overflow: hidden;
}

.hero.hero-404 {
  justify-content: center;
  align-items: center;
  max-height: none;
  padding-top: 64px;
  padding-bottom: 64px;
}

.hero.info-hero {
  height: auto;
  min-height: auto;
  max-height: none;
  padding-top: 280px;
  padding-bottom: 80px;
}

.hero-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
  position: relative;
}

.hero-content.hero-content-404 {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 64px;
}

.hero-content.info-hero-content {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  justify-content: flex-start;
  align-items: center;
}

.hero-text {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.buttons-wrapper {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  justify-content: center;
  align-items: center;
  display: flex;
}

.button {
  border-radius: var(--_sizes---medium-radius);
  background-color: var(--accent);
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 24px 28px;
  position: relative;
}

.button:where(.w-variant-c95095ce-7382-225f-41af-d39d3577dbad) {
  background-color: #0000;
}

.button:where(.w-variant-4be33950-fd64-2206-c3d4-b88ff314674c) {
  color: var(--white);
  background-color: #0000;
}

.hero-image {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

.image.hero-image {
  aspect-ratio: 4 / 3;
  width: 100%;
}

.image.bg-image {
  z-index: -1;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0%;
}

.image.background-image {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0%;
}

.image.barcode {
  width: 200px;
}

.product {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  border-left: 3px solid var(--accent);
  flex-direction: column;
  padding-left: 16px;
  display: flex;
  position: absolute;
  top: -40px;
  left: 0;
}

.product-text-wrapper {
  grid-column-gap: 2px;
  grid-row-gap: 2px;
  flex-direction: column;
  display: flex;
}

.details {
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.divider {
  aspect-ratio: 1;
  background-color: var(--black);
  object-fit: cover;
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  width: 3px;
}

.divider.white {
  background-color: var(--white);
}

.volume {
  background-color: var(--black-opacity--10);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  border-radius: 6px;
  justify-content: center;
  align-items: center;
  padding: 1px 4px;
}

.volume:where(.w-variant-c117d205-5160-da51-4d35-ee2981ddee0e) {
  background-color: var(--white-opacity--20);
  color: var(--white);
}

.illustration {
  object-fit: fill;
}

.illustration.hero-arrow {
  width: 86px;
  position: absolute;
  top: -16px;
  left: 200px;
  transform: rotate(10deg);
}

.illustration.quality-badge-illu {
  aspect-ratio: 1;
  width: 40px;
}

.illustration.hero-1-illu {
  aspect-ratio: 1;
  width: 144px;
  position: absolute;
  top: -96px;
  left: 40px;
  transform: rotate(-10deg);
}

.illustration.hero-2-illu {
  aspect-ratio: 1;
  width: 168px;
  position: absolute;
  top: -32px;
  right: 40px;
}

.illustration.ticker-illu {
  aspect-ratio: 1;
  width: 20px;
}

.illustration.featured-block-illu {
  width: 70px;
}

.illustration.section-heading-illu {
  width: 120px;
}

.illustration.mood-illu {
  width: 200px;
  position: absolute;
  top: 88px;
  right: 180px;
  transform: rotate(-30deg);
}

.illustration.wheel-center-illu {
  aspect-ratio: 1;
  width: 100%;
}

.illustration.wheel-arrow {
  transform-origin: 0 0;
  width: 104px;
  position: absolute;
  bottom: 20px;
  left: 26px;
}

.illustration.time-illu {
  width: 64px;
}

.illustration.time-tab-illu {
  width: 24px;
}

.illustration.receipt-illu {
  width: 48px;
}

.illustration.barcode-illu {
  aspect-ratio: 1;
  width: 10px;
}

.illustration.time-arrow-illu {
  width: 96px;
  position: absolute;
  bottom: 24px;
  right: 222px;
  transform: rotate(15deg);
}

.illustration.receipt-1-illu {
  width: 80px;
  position: absolute;
  bottom: 80px;
  left: -160px;
  transform: rotate(-10deg);
}

.illustration.receipt-2-illu {
  width: 40px;
  position: absolute;
  bottom: 130px;
  left: -208px;
  transform: rotate(20deg);
}

.illustration.receipt-3-illu {
  width: 24px;
  position: absolute;
  bottom: 170px;
  left: -160px;
  transform: rotate(-10deg);
}

.illustration.spot-illu {
  width: 64px;
}

.illustration.slider-illu {
  width: 80px;
}

.illustration.rating-illu {
  width: 20px;
}

.illustration.location-block-illu {
  width: 56px;
}

.illustration.location-block-illu.abs {
  opacity: 0;
  position: absolute;
}

.illustration.email-block-illu {
  width: 28px;
}

.illustration.email-block-illu.abs {
  opacity: 0;
  position: absolute;
}

.illustration.hours-block-illu {
  width: 40px;
}

.illustration.visit-section-1 {
  width: 29px;
  position: absolute;
  top: 16px;
  left: 378px;
}

.illustration.visit-section-2 {
  width: 41px;
  position: absolute;
  bottom: -24px;
  right: 320px;
  transform: rotate(-45deg);
}

.illustration.footer-logo-illu {
  width: 48px;
  position: absolute;
  top: -16px;
  left: 80px;
  transform: rotate(30deg);
}

.illustration.receipt-4-illu {
  width: 48px;
  display: none;
  position: absolute;
}

.illustration.wheel-illu {
  width: 80px;
  position: absolute;
  bottom: -16px;
  right: -16px;
  transform: rotate(120deg);
}

.illustration.wheel-illu-arrow {
  width: 144px;
  position: absolute;
  top: 200px;
  right: -200px;
  transform: rotate(15deg);
}

.illustration.licenses-block-illu {
  width: 64px;
}

.illustration.licenses-block-illu.abs {
  opacity: 0;
  position: absolute;
  top: 28px;
  left: 28px;
}

.illustration.wheel-illu-arrow-2 {
  width: 144px;
  display: none;
  position: absolute;
  top: 200px;
  right: -200px;
  transform: rotate(15deg);
}

.quality-badge {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  flex: 0 auto;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  position: absolute;
  top: -8px;
  right: 162px;
  transform: rotate(10deg);
}

.h1 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h1);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.h1.hero-h1 {
  text-align: center;
  max-width: 720px;
}

.button-background {
  z-index: 0;
  background-color: var(--white);
  border-radius: 18px;
  position: absolute;
  inset: 0%;
  transform: scale(0);
}

.button-background:where(.w-variant-7bee968e-03c2-edfa-565b-ad5e754c12e2) {
  background-color: var(--black);
}

.button-background:where(.w-variant-c95095ce-7382-225f-41af-d39d3577dbad) {
  background-color: var(--black-opacity--10);
}

.button-background:where(.w-variant-4be33950-fd64-2206-c3d4-b88ff314674c) {
  background-color: var(--white-opacity--10);
}

.top-index {
  z-index: 1;
  position: relative;
}

.button-border {
  z-index: 2;
  border-top-style: solid;
  border-top-width: 3px;
  border-top-color: var(--accent);
  border-right-style: solid;
  border-right-width: 3px;
  border-right-color: var(--accent);
  border-bottom-style: solid;
  border-bottom-width: 3px;
  border-bottom-color: var(--accent);
  border-left-style: solid;
  border-left-width: 3px;
  border-left-color: var(--accent);
  border-top-left-radius: var(--_sizes---medium-radius);
  border-top-right-radius: var(--_sizes---medium-radius);
  border-bottom-left-radius: var(--_sizes---medium-radius);
  border-bottom-right-radius: var(--_sizes---medium-radius);
  pointer-events: none;
  position: absolute;
  inset: 0%;
}

.button-border:where(.w-variant-c95095ce-7382-225f-41af-d39d3577dbad) {
  border-color: var(--black);
}

.button-border:where(.w-variant-4be33950-fd64-2206-c3d4-b88ff314674c) {
  border-color: var(--white);
}

.display-s {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--display-s);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.display-s.x {
  flex: none;
}

.emphasis-m {
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--emphasis-m);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--bold);
  letter-spacing: var(--_fonts---letter-spacing--s);
}

.emphasis-m.x {
  flex: none;
}

.body-s {
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--body-s);
  line-height: var(--_fonts---line-height--l);
  font-weight: var(--_fonts---font-weight--medium);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.handwritten-l {
  font-family: var(--_fonts---font-family--gochi-hand);
  font-size: var(--_fonts---font-size--handwritten-l);
  line-height: var(--_fonts---line-height--m);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--l);
}

.handwritten-l.opacity {
  opacity: .6;
}

.ticker {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  background-color: var(--accent);
  justify-content: flex-start;
  align-items: center;
  padding-top: 24px;
  padding-bottom: 24px;
  overflow: hidden;
}

.ticker-line {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  flex: none;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.ticker-line.first {
  padding-right: 12px;
}

.ticker-line.second {
  padding-left: 12px;
}

.ticker-content {
  justify-content: flex-start;
  align-items: center;
  display: flex;
  overflow: hidden;
}

.section {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  text-decoration: none;
  display: flex;
  position: relative;
}

.section.top-padd {
  padding-top: 160px;
}

.section.both-padd {
  padding-top: 160px;
  padding-bottom: 160px;
}

.section.both-padd.black {
  background-color: var(--black);
  color: var(--white);
}

.section.both-padd.large {
  padding-top: 200px;
  padding-bottom: 200px;
  overflow: hidden;
}

.section.testimonials-section {
  height: 100vh;
  min-height: 760px;
}

.section.bottom-padd {
  padding-bottom: 160px;
}

.products-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.section-heading {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: 1fr;
  display: grid;
}

.section-heading.default {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  position: relative;
}

.heading-title {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.label {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  color: var(--black);
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.label:where(.w-variant-741ec5de-91c1-1c12-f741-a9f22b3a3b72) {
  color: var(--white);
}

.circle {
  aspect-ratio: 1;
  background-color: var(--accent);
  object-fit: cover;
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  width: 8px;
}

.text-wrapper {
  flex-flow: column;
  justify-content: flex-end;
  align-items: stretch;
  height: 100%;
  display: flex;
}

.menu-blocks {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.image-featured-menu-block {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  height: 100%;
  color: var(--white);
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 28px;
  display: flex;
  position: relative;
  overflow: hidden;
}

.linear {
  z-index: -1;
  object-fit: cover;
  background-image: linear-gradient(#0000 35%, #000000bf);
  justify-content: center;
  align-items: center;
  position: absolute;
  inset: 0%;
}

.block-items-wrapper {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  flex-direction: column;
  width: 100%;
  display: flex;
}

.name-and-details {
  grid-column-gap: 4px;
  grid-row-gap: 4px;
  flex-direction: column;
  display: flex;
}

.badge {
  background-color: var(--accent);
  color: var(--black);
  border-radius: 48px;
  justify-content: center;
  align-items: center;
  padding: 8px 12px 6px;
  position: absolute;
  top: 28px;
  left: 28px;
}

.menu-blocks-wrapper {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  display: flex;
}

.menu-blocks-wrapper.small {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.illustration-featured-menu-block {
  grid-column-gap: 64px;
  grid-row-gap: 64px;
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--accent);
  flex-direction: column;
  padding: 28px;
  display: flex;
}

.illustration-featured-menu-block:where(.w-variant-faaa4315-b712-1925-827e-0cc7395f755f) {
  background-color: var(--black);
  color: var(--white);
}

.illustration-and-text-wrapper {
  justify-content: space-between;
  align-items: flex-start;
  display: flex;
}

.info {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  flex-direction: column;
  display: flex;
}

.h2 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h2);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.h2.heading-h2 {
  max-width: 480px;
}

.h2.heading-h2.align-center {
  text-align: center;
}

.h2.accent {
  color: var(--accent);
}

.body-l {
  font-family: var(--_fonts---font-family--inter);
  font-size: var(--_fonts---font-size--body-l);
  line-height: var(--_fonts---line-height--l);
  font-weight: var(--_fonts---font-weight--medium);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.body-l.secton-description {
  max-width: 264px;
}

.body-l.block-description {
  max-width: 360px;
}

.body-l.block-description.small {
  max-width: 264px;
}

.body-l.hero-description {
  text-align: center;
  max-width: 480px;
}

.body-l.opacity {
  color: var(--black-opacity--80);
}

.h3 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h3-l);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.h3.block-title {
  max-width: 400px;
}

.h3.block-title.small {
  max-width: 240px;
}

.h3.h3-small {
  font-size: var(--_fonts---font-size--h3-s);
}

.h3.h3-small.block-text {
  max-width: 224px;
}

.h3.h3-small.email-block-text {
  width: 130%;
  position: absolute;
  bottom: 60px;
  transform: rotate(-90deg);
}

.handwritten-s {
  font-family: var(--_fonts---font-family--gochi-hand);
  font-size: var(--_fonts---font-size--handwritten-s);
  line-height: var(--_fonts---line-height--m);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--l);
}

.handwritten-s.opacity {
  color: var(--black-opacity--80);
}

.handwritten-s.x {
  flex: none;
}

.image-featured-menu-block-wrapper {
  height: 640px;
}

.image-featured-menu-block-wrapper._2 {
  flex: 1;
  height: auto;
}

.volume-wrapper.second {
  display: none;
}

.volume-wrapper.second:where(.w-variant-faaa4315-b712-1925-827e-0cc7395f755f) {
  display: block;
}

.volume-wrapper.first:where(.w-variant-faaa4315-b712-1925-827e-0cc7395f755f) {
  display: none;
}

.menu-section-content {
  grid-column-gap: 120px;
  grid-row-gap: 120px;
  flex-direction: column;
  display: flex;
}

.menu-info {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.menu-categories {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.menu-row {
  grid-column-gap: 120px;
  grid-row-gap: 120px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.menu-category {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  display: flex;
}

.category-header {
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  border-bottom: 3px solid var(--black-opacity--10);
  flex-direction: column;
  padding-bottom: 16px;
  display: flex;
}

.text-and-volume-wrapper {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.volumes-wrapper {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  flex: 0 auto;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.menu-items {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  flex-direction: column;
  display: flex;
}

.menu-item {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.mood-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.heading-text-wrapper {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.wheel-product {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.product-block-wrapper {
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  display: flex;
}

.product-block {
  grid-column-gap: 28px;
  grid-row-gap: 28px;
  border-radius: var(--_sizes---main-radius);
  background-color: var(--white);
  width: 100%;
  max-width: 360px;
  color: var(--black);
  flex-direction: column;
  padding: 12px;
  display: flex;
}

.info-wrapper {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  flex-direction: column;
  padding-bottom: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
}

.text-and-wheel {
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  position: relative;
}

.wheel {
  grid-column-gap: 3px;
  grid-row-gap: 3px;
  background-color: var(--black);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  display: flex;
  position: relative;
}

.wheel-blocks {
  grid-column-gap: 3px;
  grid-row-gap: 3px;
  width: 100%;
  display: flex;
}

.wheel-block {
  aspect-ratio: 1;
  background-color: var(--white);
  width: 100%;
  color: var(--black-opacity--80);
  cursor: pointer;
  border-top-left-radius: 100%;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 80px;
  padding-right: 40px;
  transition: color .3s;
  display: flex;
}

.wheel-block:where(.w-variant-c3cea76c-f715-02ec-6c87-fc8cb25a45cd) {
  border-top-left-radius: 0;
  border-top-right-radius: 100%;
  justify-content: flex-end;
  align-items: flex-start;
  padding-left: 40px;
  padding-right: 0;
}

.wheel-block:where(.w-variant-4fd6df7f-2fdc-eeb5-087e-32f96cf9d86e) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 100%;
  justify-content: flex-start;
  align-items: flex-end;
  padding-top: 80px;
  padding-bottom: 0;
}

.wheel-block:where(.w-variant-b6aea3f4-3b6c-48a1-2178-70e52cc9d285) {
  border-top-left-radius: 0;
  border-bottom-right-radius: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 80px 0 0 40px;
}

.wheel-block:hover {
  color: var(--black);
}

.wheel-text {
  grid-column-gap: 6px;
  grid-row-gap: 6px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 128px;
  display: flex;
}

.wheel-center {
  flex: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
  position: absolute;
}

.wheel-circle {
  aspect-ratio: 1;
  border: 3px solid var(--black);
  background-color: var(--accent);
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  width: 80px;
  padding: 24px;
  display: flex;
  position: relative;
}

.image-wrapper {
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.time-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.time-info {
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  display: flex;
  position: relative;
}

.time-wrapper {
  border-radius: var(--_sizes---main-radius);
  background-color: var(--black);
  width: 100%;
  color: var(--white);
  flex-direction: column;
  padding: 3px;
  display: flex;
}

.time-wrapper-content {
  grid-column-gap: 64px;
  grid-row-gap: 64px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  padding: 24px 24px 8px;
  display: flex;
}

.name {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  color: var(--white);
  flex: 0 auto;
  display: flex;
}

.time-wrapper-info {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  width: 100%;
  display: grid;
}

.illustration-and-text {
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  padding-top: 40px;
  padding-bottom: 40px;
  display: flex;
}

.time {
  color: var(--accent);
  display: flex;
}

.time-tabs {
  grid-column-gap: 3px;
  grid-row-gap: 3px;
  border-bottom-right-radius: 21px;
  border-bottom-left-radius: 21px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  width: 100%;
  display: grid;
  overflow: hidden;
}

.time-tab {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  background-color: var(--white);
  color: var(--black-opacity--80);
  cursor: pointer;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 24px;
  transition: color .3s;
  display: flex;
}

.time-tab:hover {
  color: var(--black);
}

.time-tab.w--current {
  background-color: var(--accent);
  color: var(--black);
}

.time-name {
  grid-column-gap: 2px;
  grid-row-gap: 2px;
  flex-direction: column;
  width: 100%;
  display: flex;
}

.display-l {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--display-l);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.display-l.white {
  color: var(--white);
}

.block-text-wrapper {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  flex-flow: column;
  display: flex;
}

.block-text-wrapper.small {
  grid-column-gap: 4px;
  grid-row-gap: 4px;
  flex: 1;
}

.block-text-wrapper.grow {
  flex: 1;
}

.philosophy-content {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.philosophy-info {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.title-and-text-wrapper {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.label-and-title {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.receipt-wrapper {
  flex: 0 auto;
  display: flex;
  position: relative;
}

.receipt {
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  background-color: var(--white);
  width: 360px;
  color: var(--black);
  flex-direction: column;
  padding: 40px 28px;
  display: flex;
  position: relative;
}

.receipt-header {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.logo-text {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.receipt-items {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  flex-direction: column;
  display: flex;
}

.receipt-item {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.receipt-total {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: flex-end;
  display: flex;
}

.barcode-text {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.barcode-text-wrapper {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.padd-text-wrapper {
  justify-content: center;
  align-items: center;
  padding-top: 2px;
}

.border {
  background-color: var(--black);
  width: 100%;
  height: 88px;
  position: absolute;
}

.border.top-border {
  width: 101%;
  top: -56px;
  left: -5px;
  transform: rotate(-2deg);
}

.border.top-border.white {
  background-color: var(--white);
}

.border.bottom-border {
  width: 101%;
  bottom: -56px;
  left: -5px;
  transform: rotate(2deg);
}

.border.bottom-border.white {
  background-color: var(--white);
}

.receipt-info {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  width: 100%;
  display: flex;
}

.divider-border {
  background-color: var(--black-opacity--10);
  height: 3px;
}

.receipt-circle {
  aspect-ratio: 1;
  background-color: var(--black);
  border-radius: 100px;
  width: 16px;
}

.atmosphere-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.spot {
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--accent);
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  place-items: end stretch;
  padding-left: 0;
  padding-right: 0;
  display: grid;
  overflow: hidden;
}

.spot-info {
  flex-direction: column;
  display: flex;
}

.spot-details {
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 400px;
  padding: 28px;
  display: flex;
}

.illustration-text {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.text-hashtags {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  flex-direction: column;
  width: 100%;
  display: flex;
}

.hashtags {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.spot-tab {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  border-top: 3px solid var(--black-opacity--10);
  color: var(--black-opacity--80);
  background-color: #0000;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 28px;
  transition: color .3s;
  display: flex;
}

.spot-tab:hover {
  color: var(--black);
}

.spot-tab.w--current {
  background-color: var(--black);
  color: var(--white);
  cursor: pointer;
}

.spot-image {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 670px;
  display: flex;
  position: relative;
}

.hotspot {
  background-color: var(--white-opacity--20);
  border-radius: 100px;
  flex: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
}

.hotspot:where(.w-variant-15f52619-8149-7be7-d4da-02544603490c) {
  padding: 6px;
}

.hotspot-content {
  aspect-ratio: 1;
  border: 3px solid var(--white);
  background-color: var(--white);
  border-radius: 100px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  padding: 8px;
  display: flex;
  overflow: hidden;
}

.hotspot-content:where(.w-variant-15f52619-8149-7be7-d4da-02544603490c) {
  background-color: var(--accent);
}

.testimonials-content {
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 48px;
  padding-bottom: 48px;
  display: flex;
  position: relative;
}

.testimonials-info {
  grid-column-gap: 48px;
  grid-row-gap: 48px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  display: flex;
}

.rating-and-name {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.rating {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.slider-button {
  aspect-ratio: 1;
  border: 3px solid var(--black);
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  width: 44px;
  margin-bottom: 0;
  display: flex;
  left: 0%;
  right: 0%;
  overflow: hidden;
}

.slider-button._1 {
  right: 50px;
}

.slider-button._2 {
  left: 50px;
}

.spot-content {
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
  overflow: hidden;
}

.spot-tabs {
  flex-flow: column;
  display: flex;
}

.hotspot-wrapper {
  position: absolute;
}

.hotspot-wrapper._1 {
  justify-content: center;
  align-items: center;
  bottom: 80px;
  left: 40px;
}

.hotspot-wrapper._2 {
  bottom: 174px;
  right: 360px;
}

.hotspot-wrapper._3 {
  bottom: 230px;
  left: 40px;
}

.hotspot-wrapper._4 {
  top: 280px;
  left: 200px;
}

.display-m {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--display-m);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.display-m.slider-text {
  text-align: center;
  max-width: 720px;
}

.text-w {
  padding-top: 2px;
}

.divider-line {
  background-color: var(--black);
  width: 12px;
  height: 2px;
}

.testimonials-slider {
  background-color: #0000;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-bottom: 48px;
  display: flex;
}

.mask {
  width: 100%;
  height: auto;
}

.slide-nav {
  display: none;
}

.visit-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-direction: column;
  display: flex;
}

.visit-info {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  height: 600px;
  display: grid;
}

.column {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  display: flex;
}

.hours-block {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  border-radius: var(--_sizes---main-radius);
  background-color: var(--white);
  color: var(--black);
  justify-content: flex-start;
  align-items: flex-start;
  padding: 28px;
  display: flex;
}

.photo-block {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  border-radius: var(--_sizes---main-radius);
  background-color: var(--white);
  height: 100%;
  color: var(--black);
  flex-direction: column;
  flex: 1;
  padding: 12px;
  display: flex;
}

.photo-text-wrapper {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  justify-content: flex-start;
  align-items: flex-start;
  padding-bottom: 12px;
  padding-left: 16px;
  padding-right: 16px;
}

.contact-items {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  display: flex;
}

.location-block {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  border: 3px solid var(--accent);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--accent);
  color: var(--black);
  flex: 1;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 28px;
  display: flex;
}

.email-block {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  border: 3px solid var(--accent);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--accent);
  color: var(--black);
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 28px 24px;
  display: flex;
  position: relative;
}

.receipt-circles {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  position: absolute;
  left: -8px;
  right: -8px;
}

.receipt-circles.top {
  top: -8px;
}

.receipt-circles.bottom {
  bottom: -8px;
}

.photo-image-wrapper {
  border-radius: 12px;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.location-info {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-flow: column;
  flex: 1;
  height: 100%;
  display: flex;
}

.illu-wrapper, .email-illu-wrapper {
  flex-flow: column;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
}

.footer {
  background-color: var(--white);
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 80px;
  padding-bottom: 80px;
  display: flex;
}

.footer-content {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.footer-info {
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  display: flex;
}

.footer-info-text {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
  position: relative;
}

.footer-menu {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.menu-block {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.footer-links {
  grid-column-gap: 4px;
  grid-row-gap: 4px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
}

.footer-link {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 4px;
  padding-bottom: 4px;
  display: flex;
}

.f-link-icon-wrapper {
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding-top: 2px;
  padding-bottom: 2px;
  display: flex;
}

.info-bar-content-wrapper {
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.p-block-wrapper {
  flex: 1;
}

.prod-block-wrapper {
  width: 100%;
  max-width: 360px;
}

.prod-block-wrapper._2, .prod-block-wrapper._3, .prod-block-wrapper._4 {
  display: none;
}

.label-and-title-w {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  display: flex;
}

.licenses-content {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  flex-direction: column;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.licenses-blocks {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  flex-direction: column;
  grid-template-rows: auto auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  display: grid;
}

.licenses-block {
  grid-column-gap: 64px;
  grid-row-gap: 64px;
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--black);
  color: var(--white);
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 28px;
  display: flex;
  position: relative;
  overflow: hidden;
}

.l-block-wrapper {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  justify-content: flex-start;
  align-items: flex-end;
  width: 100%;
  display: flex;
}

.color-card-info {
  border-top: 3px solid var(--black);
  flex-flow: column;
  padding: 12px 16px;
  display: flex;
}

.block-master {
  grid-column-gap: 48px;
  grid-row-gap: 48px;
  flex-flow: column;
  display: flex;
}

.tile-item {
  grid-column-gap: 32px;
  grid-row-gap: 32px;
  flex-flow: column;
  display: flex;
}

.h5 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h5);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.style-item {
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.h4 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h4);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.all-buttons-wrapper {
  grid-column-gap: 48px;
  grid-row-gap: 32px;
  flex-flow: wrap;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  display: flex;
}

.color-card {
  border-top-style: solid;
  border-top-width: 3px;
  border-top-color: var(--black);
  border-right-style: solid;
  border-right-width: 3px;
  border-right-color: var(--black);
  border-bottom-style: solid;
  border-bottom-width: 3px;
  border-bottom-color: var(--black);
  border-left-style: solid;
  border-left-width: 3px;
  border-left-color: var(--black);
  border-top-left-radius: var(--_sizes---small-radius);
  border-top-right-radius: var(--_sizes---small-radius);
  border-bottom-left-radius: var(--_sizes---small-radius);
  border-bottom-right-radius: var(--_sizes---small-radius);
  background-color: var(--black-opacity--10);
  -webkit-user-select: none;
  user-select: none;
  flex-flow: column;
  display: flex;
  overflow: hidden;
}

.color-tile {
  aspect-ratio: 1;
  width: 100%;
}

.color-tile.accent {
  background-color: var(--accent);
}

.color-tile.black {
  background-color: var(--black);
}

.color-tile.white {
  background-color: var(--white);
}

.color-tile.white-60 {
  background-color: var(--white-opacity--60);
}

.color-tile.white-20 {
  background-color: var(--white-opacity--20);
}

.color-tile.white-10 {
  background-color: var(--white-opacity--10);
}

.color-tile.black-60 {
  background-color: var(--black-opacity--80);
}

.color-tile.black-10 {
  background-color: var(--black-opacity--10);
}

.colors-grid {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

.block-master-tile {
  grid-column-gap: 48px;
  grid-row-gap: 48px;
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  background-color: var(--black-opacity--10);
  flex-flow: column;
  padding: 48px 28px;
  display: flex;
}

.frame {
  flex-flow: column;
  display: flex;
}

.tile-divider {
  background-color: var(--black-opacity--10);
  width: 100%;
  height: 3px;
  margin-right: auto;
}

.h6 {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: var(--_fonts---font-size--h6);
  line-height: var(--_fonts---line-height--s);
  font-weight: var(--_fonts---font-weight--regular);
  letter-spacing: var(--_fonts---letter-spacing--m);
}

.button-tile {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.colors-category {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  flex-flow: column;
  display: flex;
}

.style-text-info {
  grid-column-gap: 24px;
  grid-row-gap: 12px;
  flex-flow: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.body-l-2 {
  letter-spacing: -.02em;
  font-size: 18px;
  line-height: 140%;
}

.body-l-2.hero-description {
  max-width: 480px;
}

.h1-2 {
  max-width: 400px;
}

.tile-item-halves {
  grid-column-gap: 24px;
  grid-row-gap: 24px;
  flex-flow: column;
  grid-template-rows: auto;
  justify-content: flex-start;
  place-items: stretch start;
  width: 100%;
  display: flex;
}

.sguide-content {
  grid-column-gap: 80px;
  grid-row-gap: 80px;
  flex-flow: column;
  display: flex;
}

.footer-info-links {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  place-items: start;
  display: grid;
}

.footer-links-wrapper {
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  grid-template-rows: auto;
  grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr) minmax(1px, 1fr);
  grid-auto-columns: minmax(1px, 1fr);
  width: 100%;
  display: grid;
}

.text-and-links {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  flex-flow: column;
  display: flex;
}

.links {
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  justify-content: flex-start;
  align-items: center;
  display: flex;
}

.link {
  padding-top: 4px;
  padding-bottom: 4px;
  transition: color .3s;
}

.link:hover {
  color: var(--black-opacity--80);
}

.links-wrapper {
  grid-column-gap: 12px;
  grid-row-gap: 12px;
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

@media screen and (max-width: 991px) {
  body {
    --_fonts---font-family--inter: Inter, sans-serif;
    --_fonts---font-size--body-l: 18px;
    --_fonts---line-height--l: 144%;
    --_fonts---font-weight--medium: 500;
    --_fonts---letter-spacing--m: -.01em;
    --_fonts---font-family--londrina-solid: "Londrina Solid", sans-serif;
    --_fonts---font-size--h1: 88px;
    --_fonts---line-height--s: 100%;
    --_fonts---font-weight--regular: 400;
    --_fonts---font-size--h2: 68px;
    --_fonts---font-size--h3-l: 40px;
    --_fonts---font-size--h4: 24px;
    --_fonts---font-size--h5: 20px;
    --_fonts---font-size--h6: 18px;
    --_fonts---font-size--body-m: 14px;
    --_fonts---font-size--logo: 48px;
    --_fonts---font-size--emphasis-l: 18px;
    --_fonts---font-weight--bold: 700;
    --_fonts---letter-spacing--s: -.02em;
    --_fonts---font-size--display-s: 24px;
    --_fonts---font-size--emphasis-m: 14px;
    --_fonts---font-size--body-s: 10px;
    --_fonts---font-family--gochi-hand: "Gochi Hand", sans-serif;
    --_fonts---font-size--handwritten-l: 21px;
    --_fonts---line-height--m: 104%;
    --_fonts---letter-spacing--l: 0em;
    --_fonts---font-size--h3-s: 28px;
    --_fonts---font-size--handwritten-s: 16px;
    --_fonts---font-size--display-l: 224px;
    --_fonts---font-size--display-m: 48px;
  }

  .container {
    max-width: 1328px;
  }

  .body-m.align-center.vertical {
    z-index: 1;
    writing-mode: horizontal-tb;
    width: 144px;
    height: auto;
    position: absolute;
    inset: 40px auto auto 0%;
    transform: rotate(-45deg);
  }

  .hero {
    min-height: 880px;
    padding-top: 320px;
  }

  .hero-content {
    grid-column-gap: 160px;
    grid-row-gap: 160px;
    justify-content: flex-start;
    align-items: center;
  }

  .hero-text, .hero-image {
    width: 100%;
  }

  .product {
    top: -64px;
  }

  .illustration.hero-arrow {
    top: -42px;
    left: 192px;
  }

  .illustration.hero-1-illu {
    width: 80px;
    left: auto;
  }

  .illustration.hero-2-illu {
    display: none;
  }

  .illustration.section-heading-illu {
    width: 96px;
  }

  .illustration.mood-illu {
    width: 144px;
    top: 112px;
    right: 20px;
  }

  .illustration.time-illu {
    width: 72px;
  }

  .illustration.receipt-1-illu {
    left: -120px;
  }

  .illustration.receipt-2-illu {
    bottom: 170px;
    left: -100px;
  }

  .illustration.receipt-3-illu {
    bottom: 220px;
    left: -80px;
  }

  .illustration.visit-section-1 {
    left: 154px;
  }

  .illustration.visit-section-2 {
    right: 100px;
    transform: rotate(-30deg);
  }

  .illustration.receipt-4-illu {
    display: block;
    top: -48px;
    right: -80px;
  }

  .illustration.wheel-illu {
    width: 80px;
    bottom: 0;
    right: 0;
  }

  .illustration.wheel-illu-arrow {
    width: 144px;
    display: none;
    top: 112px;
    right: 20px;
  }

  .illustration.wheel-illu-arrow-2 {
    width: 120px;
    display: block;
    inset: auto auto -80px 24px;
    transform: rotate(45deg);
  }

  .quality-badge {
    top: -32px;
    right: 80px;
  }

  .h1.hero-h1 {
    max-width: 616px;
  }

  .section.testimonials-section {
    min-height: 880px;
  }

  .section-heading {
    grid-column-gap: 24px;
    grid-row-gap: 24px;
    display: flex;
  }

  .text-wrapper {
    height: auto;
  }

  .menu-blocks {
    flex-flow: column;
    display: flex;
  }

  .h2.heading-h2 {
    max-width: 408px;
  }

  .h3.h3-small.email-block-text {
    flex: 1;
    width: 100%;
    position: static;
    transform: none;
  }

  .image-featured-menu-block-wrapper {
    aspect-ratio: 1;
    height: auto;
  }

  .image-featured-menu-block-wrapper._2 {
    aspect-ratio: 2;
    flex: 0 auto;
  }

  .menu-info {
    display: flex;
  }

  .menu-row {
    grid-column-gap: 64px;
    grid-row-gap: 64px;
  }

  .mood-content {
    grid-column-gap: 120px;
    grid-row-gap: 120px;
  }

  .wheel-product {
    grid-column-gap: 120px;
    grid-row-gap: 120px;
    flex-flow: column;
    display: flex;
  }

  .product-block-wrapper {
    justify-content: center;
    align-items: center;
  }

  .product-block {
    max-width: 400px;
  }

  .wheel-blocks {
    grid-column-gap: 3px;
    grid-row-gap: 3px;
    grid-template-rows: auto;
    grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
    grid-auto-columns: minmax(1px, 1fr);
    display: grid;
  }

  .wheel-block {
    flex: 1;
    padding-bottom: 104px;
    padding-right: 72px;
  }

  .wheel-block:where(.w-variant-c3cea76c-f715-02ec-6c87-fc8cb25a45cd) {
    flex: 1;
    padding-left: 72px;
  }

  .wheel-block:where(.w-variant-4fd6df7f-2fdc-eeb5-087e-32f96cf9d86e) {
    padding-top: 104px;
  }

  .wheel-block:where(.w-variant-b6aea3f4-3b6c-48a1-2178-70e52cc9d285) {
    padding-top: 104px;
    padding-left: 72px;
  }

  .time-wrapper-info {
    grid-column-gap: 8px;
    grid-row-gap: 8px;
    flex-flow: column-reverse;
    display: flex;
  }

  .illustration-and-text {
    grid-column-gap: 24px;
    grid-row-gap: 24px;
    flex-flow: row;
    justify-content: flex-start;
    align-items: center;
    height: auto;
    padding-top: 0;
    padding-bottom: 0;
  }

  .time-tabs {
    grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  }

  .philosophy-content {
    grid-column-gap: 120px;
    grid-row-gap: 120px;
    flex-flow: column;
  }

  .spot {
    align-items: start;
  }

  .spot-info {
    height: 562px;
  }

  .spot-details {
    height: 296px;
  }

  .illustration-text {
    flex-flow: row-reverse;
  }

  .text-hashtags {
    flex: 1;
  }

  .spot-image {
    aspect-ratio: 4 / 3;
    height: auto;
  }

  .slider-button {
    margin-left: 298px;
    margin-right: 298px;
  }

  .slider-button._1, .slider-button._2 {
    margin-left: auto;
    margin-right: auto;
  }

  .spot-content {
    grid-template-rows: auto auto;
  }

  .spot-tabs {
    margin-top: 296px;
  }

  .hotspot-wrapper._1 {
    bottom: 50px;
  }

  .hotspot-wrapper._2 {
    bottom: 124px;
    right: 300px;
  }

  .hotspot-wrapper._3 {
    bottom: 180px;
    left: 60px;
  }

  .hotspot-wrapper._4 {
    top: 212px;
    left: 184px;
  }

  .display-m.slider-text {
    max-width: 576px;
  }

  .visit-info {
    grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
    height: auto;
  }

  .column.second {
    grid-column-gap: 16px;
    grid-row-gap: 16px;
    grid-template-rows: auto;
    grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
    grid-auto-columns: minmax(1px, 1fr);
    display: grid;
  }

  .contact-items {
    flex-flow: column;
  }

  .email-block {
    flex-flow: row-reverse;
  }

  .footer {
    padding-top: 64px;
    padding-bottom: 64px;
  }

  .footer-content {
    grid-column-gap: 120px;
    grid-row-gap: 120px;
    flex-flow: column-reverse;
    display: flex;
  }

  .footer-info {
    grid-column-gap: 32px;
    grid-row-gap: 32px;
    justify-content: flex-start;
  }

  .photo-block-wrapper {
    height: 480px;
  }

  .prod-block-wrapper {
    max-width: 400px;
  }

  .licenses-content {
    display: flex;
  }

  .all-buttons-wrapper {
    grid-template-columns: 1fr 1fr;
    justify-content: flex-start;
    align-items: center;
  }

  .colors-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media screen and (max-width: 767px) {
  body {
    --_fonts---font-family--inter: Inter, sans-serif;
    --_fonts---font-size--body-l: 18px;
    --_fonts---line-height--l: 144%;
    --_fonts---font-weight--medium: 500;
    --_fonts---letter-spacing--m: -.01em;
    --_fonts---font-family--londrina-solid: "Londrina Solid", sans-serif;
    --_fonts---font-size--h1: 52px;
    --_fonts---line-height--s: 100%;
    --_fonts---font-weight--regular: 400;
    --_fonts---font-size--h2: 48px;
    --_fonts---font-size--h3-l: 32px;
    --_fonts---font-size--h4: 24px;
    --_fonts---font-size--h5: 20px;
    --_fonts---font-size--h6: 18px;
    --_fonts---font-size--body-m: 14px;
    --_fonts---font-size--logo: 40px;
    --_fonts---font-size--emphasis-l: 18px;
    --_fonts---font-weight--bold: 700;
    --_fonts---letter-spacing--s: -.02em;
    --_fonts---font-size--display-s: 21px;
    --_fonts---font-size--emphasis-m: 14px;
    --_fonts---font-size--body-s: 10px;
    --_fonts---font-family--gochi-hand: "Gochi Hand", sans-serif;
    --_fonts---font-size--handwritten-l: 18px;
    --_fonts---line-height--m: 104%;
    --_fonts---letter-spacing--l: 0em;
    --_fonts---font-size--h3-s: 24px;
    --_fonts---font-size--handwritten-s: 16px;
    --_fonts---font-size--display-l: 96px;
    --_fonts---font-size--display-m: 36px;
  }

  .info-bar-content.second {
    flex: none;
    padding-left: 6px;
    display: flex;
  }

  .info-bar-content.first {
    flex: none;
    padding-right: 6px;
  }

  .container {
    max-width: 1328px;
    padding-left: 32px;
    padding-right: 32px;
  }

  .body-m.align-center.vertical {
    position: static;
    transform: none;
  }

  .body-m.x {
    flex: none;
  }

  .icon.info-bar-icon.hidden {
    display: block;
  }

  .hero {
    min-height: 800px;
    max-height: 880px;
    padding-top: 296px;
  }

  .hero.info-hero {
    padding-top: 264px;
    padding-bottom: 64px;
  }

  .hero-content.hero-content-404 {
    padding-top: 80px;
  }

  .product, .illustration.hero-arrow {
    display: none;
  }

  .illustration.ticker-illu {
    width: 16px;
  }

  .illustration.section-heading-illu {
    width: 64px;
  }

  .illustration.mood-illu {
    display: none;
  }

  .illustration.wheel-arrow {
    width: 64px;
    bottom: 12px;
    left: 25px;
  }

  .illustration.receipt-1-illu, .illustration.receipt-2-illu, .illustration.receipt-3-illu, .illustration.receipt-4-illu {
    display: none;
  }

  .illustration.wheel-illu {
    width: 48px;
    bottom: 16px;
    right: 16px;
  }

  .illustration.licenses-block-illu.abs {
    top: 24px;
    left: 24px;
  }

  .quality-badge {
    top: -40px;
    right: 40px;
  }

  .h1.hero-h1 {
    max-width: 360px;
  }

  .ticker {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .ticker-line.first {
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    padding-right: 10px;
  }

  .ticker-line.second {
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    padding-left: 10px;
  }

  .section.top-padd {
    padding-top: 128px;
  }

  .section.both-padd {
    padding-top: 128px;
    padding-bottom: 128px;
  }

  .section.both-padd.black {
    overflow: hidden;
  }

  .section.both-padd.large {
    padding-top: 160px;
    padding-bottom: 160px;
  }

  .section.bottom-padd {
    padding-bottom: 128px;
  }

  .products-content {
    grid-column-gap: 64px;
    grid-row-gap: 64px;
  }

  .section-heading {
    grid-column-gap: 16px;
    grid-row-gap: 16px;
  }

  .heading-title {
    grid-column-gap: 12px;
    grid-row-gap: 12px;
  }

  .label {
    grid-column-gap: 10px;
    grid-row-gap: 10px;
  }

  .image-featured-menu-block {
    padding: 24px;
  }

  .menu-blocks-wrapper.small {
    display: flex;
  }

  .illustration-featured-menu-block {
    padding: 24px;
  }

  .h2.heading-h2 {
    max-width: 288px;
  }

  .h3.block-title {
    max-width: 320px;
  }

  .h3.block-title.small {
    max-width: 192px;
  }

  .image-featured-menu-block-wrapper._2 {
    aspect-ratio: 1;
  }

  .menu-section-content {
    grid-column-gap: 80px;
    grid-row-gap: 80px;
  }

  .menu-categories {
    grid-column-gap: 64px;
    grid-row-gap: 64px;
  }

  .menu-row {
    flex-flow: column;
    display: flex;
  }

  .text-and-wheel {
    grid-column-gap: 24px;
    grid-row-gap: 24px;
    flex-flow: column;
  }

  .wheel-block {
    padding-bottom: 40px;
    padding-right: 8px;
  }

  .wheel-block:where(.w-variant-c3cea76c-f715-02ec-6c87-fc8cb25a45cd) {
    padding-left: 8px;
  }

  .wheel-block:where(.w-variant-4fd6df7f-2fdc-eeb5-087e-32f96cf9d86e) {
    padding-top: 40px;
  }

  .wheel-block:where(.w-variant-b6aea3f4-3b6c-48a1-2178-70e52cc9d285) {
    padding-top: 40px;
    padding-left: 8px;
  }

  .wheel-circle {
    width: 64px;
    padding: 16px;
  }

  .time-content {
    grid-column-gap: 64px;
    grid-row-gap: 64px;
  }

  .philosophy-content {
    grid-column-gap: 80px;
    grid-row-gap: 80px;
  }

  .title-and-text-wrapper {
    grid-column-gap: 16px;
    grid-row-gap: 16px;
  }

  .label-and-title {
    grid-column-gap: 12px;
    grid-row-gap: 12px;
  }

  .spot-info {
    height: 552px;
  }

  .hotspot:where(.w-variant-15f52619-8149-7be7-d4da-02544603490c) {
    padding: 4px;
  }

  .hotspot-content {
    width: 40px;
  }

  .hotspot-wrapper._1 {
    bottom: 20px;
    left: 30px;
  }

  .hotspot-wrapper._2 {
    bottom: 100px;
    left: 30px;
    right: auto;
  }

  .hotspot-wrapper._3 {
    bottom: 60px;
    left: 200px;
  }

  .hotspot-wrapper._4 {
    top: 120px;
    left: 110px;
  }

  .visit-info, .column.second {
    flex-flow: column-reverse;
    display: flex;
  }

  .location-block {
    padding: 24px;
  }

  .photo-block-wrapper {
    height: 480px;
  }

  .info-bar-content-wrapper {
    overflow: hidden;
  }

  .p-block-wrapper {
    flex: 0 auto;
    height: 360px;
  }

  .label-and-title-w {
    grid-column-gap: 12px;
    grid-row-gap: 12px;
  }

  .licenses-blocks {
    display: flex;
  }

  .licenses-block {
    padding-top: 24px;
    padding-left: 24px;
    padding-right: 24px;
  }

  .block-master {
    grid-column-gap: 32px;
    grid-row-gap: 32px;
  }

  .all-buttons-wrapper {
    grid-column-gap: 40px;
  }

  .colors-grid {
    grid-template-columns: minmax(1px, 1fr) minmax(1px, 1fr);
  }

  .block-master-tile {
    grid-column-gap: 40px;
    grid-row-gap: 40px;
    padding: 32px 24px;
  }

  .h1-2 {
    max-width: 320px;
  }
}

@media screen and (max-width: 479px) {
  body {
    --_fonts---font-family--inter: Inter, sans-serif;
    --_fonts---font-size--body-l: 18px;
    --_fonts---line-height--l: 144%;
    --_fonts---font-weight--medium: 500;
    --_fonts---letter-spacing--m: -.01em;
    --_fonts---font-family--londrina-solid: "Londrina Solid", sans-serif;
    --_fonts---font-size--h1: 52px;
    --_fonts---line-height--s: 100%;
    --_fonts---font-weight--regular: 400;
    --_fonts---font-size--h2: 48px;
    --_fonts---font-size--h3-l: 32px;
    --_fonts---font-size--h4: 24px;
    --_fonts---font-size--h5: 20px;
    --_fonts---font-size--h6: 18px;
    --_fonts---font-size--body-m: 14px;
    --_fonts---font-size--logo: 40px;
    --_fonts---font-size--emphasis-l: 18px;
    --_fonts---font-weight--bold: 700;
    --_fonts---letter-spacing--s: -.02em;
    --_fonts---font-size--display-s: 21px;
    --_fonts---font-size--emphasis-m: 14px;
    --_fonts---font-size--body-s: 10px;
    --_fonts---font-family--gochi-hand: "Gochi Hand", sans-serif;
    --_fonts---font-size--handwritten-l: 18px;
    --_fonts---line-height--m: 104%;
    --_fonts---letter-spacing--l: 0em;
    --_fonts---font-size--h3-s: 24px;
    --_fonts---font-size--handwritten-s: 16px;
    --_fonts---font-size--display-l: 96px;
    --_fonts---font-size--display-m: 36px;
  }

  .hero-content {
    grid-column-gap: 104px;
    grid-row-gap: 104px;
  }

  .buttons-wrapper {
    flex-flow: column;
    justify-content: flex-start;
    align-items: stretch;
    width: 100%;
  }

  .illustration.hero-1-illu {
    width: 56px;
    top: -80px;
  }

  .illustration.time-illu {
    width: 64px;
  }

  .illustration.time-arrow-illu {
    width: 80px;
    bottom: 100px;
    right: auto;
    transform: rotate(60deg);
  }

  .illustration.slider-illu {
    width: 64px;
  }

  .illustration.visit-section-1 {
    top: 8px;
    left: 20px;
  }

  .illustration.visit-section-2 {
    display: none;
  }

  .illustration.wheel-illu {
    bottom: 0;
    right: 0;
  }

  .illustration.wheel-illu-arrow-2 {
    width: 80px;
  }

  .section-heading.default {
    grid-column-gap: 12px;
    grid-row-gap: 12px;
  }

  .h3.block-title.small {
    max-width: 192px;
  }

  .image-featured-menu-block-wrapper {
    aspect-ratio: 3 / 4;
  }

  .product-block {
    grid-column-gap: 24px;
    grid-row-gap: 24px;
    padding: 8px;
  }

  .time-info {
    grid-column-gap: 120px;
    grid-row-gap: 120px;
    justify-content: flex-end;
    align-items: center;
  }

  .time-wrapper-content {
    padding-bottom: 18px;
  }

  .name {
    grid-column-gap: 10px;
    grid-row-gap: 10px;
  }

  .illustration-and-text {
    grid-column-gap: 32px;
    grid-row-gap: 32px;
    flex-flow: column;
    justify-content: center;
    align-items: flex-start;
  }

  .time-tabs {
    flex-flow: column;
    display: flex;
  }

  .receipt-wrapper {
    flex-flow: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }

  .receipt {
    width: 100%;
    max-width: 360px;
    padding-left: 24px;
    padding-right: 24px;
  }

  .spot-info {
    height: 616px;
  }

  .spot-details {
    height: 360px;
  }

  .illustration-text {
    flex-flow: column;
  }

  .testimonials-info {
    grid-column-gap: 40px;
    grid-row-gap: 40px;
  }

  .spot-tabs {
    margin-top: 360px;
  }

  .display-m.slider-text {
    max-width: 432px;
  }

  .footer-content {
    grid-column-gap: 80px;
    grid-row-gap: 80px;
  }

  .btn-wrapper {
    flex-flow: column;
    width: 100%;
    display: flex;
  }

  .all-buttons-wrapper {
    grid-row-gap: 24px;
    grid-template-columns: 1fr;
  }

  .colors-grid {
    flex-flow: column;
    display: flex;
  }

  .button-tile {
    align-items: stretch;
    width: 100%;
  }
}

#w-node-_91eb22ba-4b0d-2425-e732-00e6304515cc-b115661b {
  grid-area: span 1 / span 3 / span 1 / span 3;
}

#w-node-_08e5f36c-dc69-b61a-91db-3bd12dd6b620-b115661b {
  grid-area: 1 / 2 / 2 / 12;
}

#w-node-bf7579ac-9353-7dc7-5922-035a854179c0-b115661b {
  grid-area: span 1 / span 6 / span 1 / span 6;
}

#w-node-bf7579ac-9353-7dc7-5922-035a854179aa-b115661b {
  grid-area: 1 / 9 / 2 / 13;
}

#w-node-d6c521d1-4cc9-97db-9655-f64a0b89f95d-b115661b {
  grid-area: span 1 / span 3 / span 1 / span 3;
}

#w-node-_4d1665b8-9a6a-d3d3-f435-9e9412cdaba6-b115661b {
  grid-area: span 1 / span 8 / span 1 / span 8;
}

#w-node-_4d1665b8-9a6a-d3d3-f435-9e9412cdabad-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-ccdff27c-5503-deee-d431-b02713665ff8-b115661b {
  grid-area: span 1 / span 8 / span 1 / span 8;
}

#w-node-ccdff27c-5503-deee-d431-b02713665fff-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-dc4f6d18-bc67-6b9f-6518-77246ab2a5c5-b115661b {
  grid-area: span 1 / span 8 / span 1 / span 8;
}

#w-node-dc4f6d18-bc67-6b9f-6518-77246ab2a5cc-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-ab6a3efd-8500-50cd-aa02-671bef3c7538-b115661b {
  grid-area: span 1 / span 8 / span 1 / span 8;
}

#w-node-ab6a3efd-8500-50cd-aa02-671bef3c753f-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-_17652220-e8d3-feaf-4584-27d747217397-b115661b {
  grid-area: span 1 / span 3 / span 1 / span 3;
}

#w-node-_6389ff94-2692-2ce6-e369-2b5257ced877-b115661b {
  grid-area: 1 / 1 / 2 / 7;
}

#w-node-_56de1f81-e301-78a0-1644-b044292df40e-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-_56de1f81-e301-78a0-1644-b044292df420-b115661b {
  grid-area: span 1 / span 2 / span 1 / span 2;
}

#w-node-_0f079cf7-8036-0f62-4a43-3897bfb179e1-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-_0f079cf7-8036-0f62-4a43-3897bfb179ee-b115661b {
  grid-area: span 1 / span 2 / span 1 / span 2;
}

#w-node-a3a0acc1-f40e-2fe9-181f-05fc81cd58cf-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-a3a0acc1-f40e-2fe9-181f-05fc81cd58dc-b115661b {
  grid-area: span 1 / span 2 / span 1 / span 2;
}

#w-node-c0290705-d462-bb61-7e04-e487f3b6bc0a-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-c0290705-d462-bb61-7e04-e487f3b6bc17-b115661b {
  grid-area: span 1 / span 2 / span 1 / span 2;
}

#w-node-_6389ff94-2692-2ce6-e369-2b5257ced86d-b115661b {
  grid-area: 1 / 5 / 2 / 7;
}

#w-node-_949c6abf-3e92-63bf-4d0f-f82d8877ba4d-b115661b {
  grid-area: span 1 / span 4 / span 1 / span 4;
}

#w-node-_09ee698c-4812-68f7-c338-efa173207b88-b115661b {
  grid-area: span 1 / span 5 / span 1 / span 5;
}

#w-node-_09ee698c-4812-68f7-c338-efa173207b7b-b115661b {
  grid-area: span 1 / span 3 / span 1 / span 3;
}

#w-node-f5bdb2f7-b75e-e6c4-4279-8cd2ce3b576f-ccbc0708 {
  grid-area: 1 / 2 / 2 / 12;
}

#w-node-_33a56f53-83d3-90e0-1a1c-0a174a917fc2-09278be8, #w-node-c1b34901-e3c8-0e13-796c-b6625e6f4b6c-09278be8, #w-node-_84fa4d62-03d4-aa46-f40f-eb75da4bb8c9-09278be8, #w-node-_1237cfdb-da34-31a5-20c7-5324c9695d02-09278be8, #w-node-_3a30b11d-81f8-ee47-c044-63c67b07abca-09278be8, #w-node-_025876e0-14cc-7c9a-bb70-723df8ba3d4a-09278be8, #w-node-_76de7cdb-5e4e-d8e8-6ec9-a6c07a90aeb9-09278be8, #w-node-_6bea4ff0-3c5a-58db-0068-d80b89a145e0-09278be8, #w-node-_53434971-e377-e5c0-a47a-258b4dec5022-09278be8, #w-node-_1861cfd1-7b2b-50f0-5169-9f0773ec71cd-09278be8, #w-node-_4b1b6ee4-4d36-196c-d9da-f31d4b8aa694-09278be8, #w-node-d849c623-50af-8154-6e0b-792890c47b23-09278be8, #w-node-_10455465-0d70-729e-7780-a83a7be13896-09278be8, #w-node-acbb98ce-1dc9-a13f-b34a-4e1ceecec2a1-09278be8, #w-node-_758e3194-a78d-e127-f3d4-6057eeec95a4-09278be8, #w-node-f4440297-bfff-f692-20df-4c2d3a99e85c-09278be8, #w-node-_57b0973f-bd21-88a7-d3af-ec634484b1a4-09278be8, #w-node-_5347c974-8024-36e1-ca50-134ac815efb8-09278be8 {
  justify-self: end;
}

@media screen and (max-width: 991px) {
  #w-node-_6389ff94-2692-2ce6-e369-2b5257ced877-b115661b {
    grid-area: 1 / 1 / 2 / 7;
  }

  #w-node-_56de1f81-e301-78a0-1644-b044292df40e-b115661b {
    grid-area: 2 / 1 / 3 / 7;
  }

  #w-node-_56de1f81-e301-78a0-1644-b044292df420-b115661b {
    grid-column: span 6 / span 6;
  }

  #w-node-_0f079cf7-8036-0f62-4a43-3897bfb179e1-b115661b {
    grid-area: 2 / 1 / 3 / 7;
  }

  #w-node-_0f079cf7-8036-0f62-4a43-3897bfb179ee-b115661b {
    grid-column: span 6 / span 6;
  }

  #w-node-a3a0acc1-f40e-2fe9-181f-05fc81cd58cf-b115661b {
    grid-area: 2 / 1 / 3 / 7;
  }

  #w-node-a3a0acc1-f40e-2fe9-181f-05fc81cd58dc-b115661b {
    grid-column: span 6 / span 6;
  }

  #w-node-c0290705-d462-bb61-7e04-e487f3b6bc0a-b115661b {
    grid-area: 2 / 1 / 3 / 7;
  }

  #w-node-c0290705-d462-bb61-7e04-e487f3b6bc17-b115661b {
    grid-column: span 6 / span 6;
  }

  #w-node-_6389ff94-2692-2ce6-e369-2b5257ced86d-b115661b {
    grid-area: 1 / 1 / 2 / 7;
  }

  #w-node-_949c6abf-3e92-63bf-4d0f-f82d8877ba4d-b115661b {
    grid-column: span 1 / span 1;
  }

  #w-node-_09ee698c-4812-68f7-c338-efa173207b88-b115661b {
    grid-column: span 2 / span 2;
  }

  #w-node-_09ee698c-4812-68f7-c338-efa173207b8e-b115661b {
    grid-area: 1 / 1 / 2 / 2;
  }

  #w-node-_09ee698c-4812-68f7-c338-efa173207b7b-b115661b {
    grid-area: 1 / 2 / 2 / 3;
  }
}

@media screen and (max-width: 479px) {
  #w-node-_9f2ed952-a983-0fd4-f510-90a3bc9ecc54-bc9ecc48, #w-node-_9f2ed952-a983-0fd4-f510-90a3bc9ecc68-bc9ecc48 {
    grid-area: span 1 / span 2 / span 1 / span 2;
  }
}

/* --- Mello Enhancements & Interactions --- */
@font-face {
  font-family: 'Gochi Hand';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/templates/mello-coffee/gochi-hand.woff2) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/templates/mello-coffee/inter.woff2) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(/templates/mello-coffee/inter.woff2) format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/templates/mello-coffee/inter.woff2) format('woff2');
}
@font-face {
  font-family: 'Londrina Solid';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/templates/mello-coffee/londrina-solid.woff2) format('woff2');
}

/* Infinite Marquee */
@keyframes melloMarquee {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}

.info-bar-content-wrapper {
  display: flex !important;
  width: max-content !important;
  overflow: hidden !important;
}
.info-bar-content {
  display: flex !important;
  animation: melloMarquee 35s linear infinite !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
.info-bar-content.second {
  display: flex !important;
}

.ticker-content {
  display: flex !important;
  width: max-content !important;
  overflow: hidden !important;
}
.ticker-line {
  display: flex !important;
  animation: melloMarquee 26s linear infinite !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
.ticker-line.second {
  display: flex !important;
}

/* Mood Matcher Wheel */
.wheel-arrow {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: 0 0;
}
.wheel-block {
  cursor: pointer;
  transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease;
}
.wheel-block:hover {
  filter: brightness(1.05);
}
.wheel-block.active {
  background-color: var(--accent) !important;
  color: var(--black) !important;
}
.wheel-block.active .wheel-text .display-s,
.wheel-block.active .wheel-text .handwritten-s {
  color: var(--black) !important;
}
.prod-block-wrapper {
  display: none;
  animation: melloFadeIn 0.35s ease forwards;
}
.prod-block-wrapper.active {
  display: block !important;
}
@keyframes melloFadeIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Time Tabs */
.time-tab {
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
.time-tab:hover {
  transform: translateY(-2px);
}
.time-tab.w--current {
  background-color: var(--white) !important;
  border-color: var(--black) !important;
}
.time-wrapper .w-tab-pane {
  display: none;
}
.time-wrapper .w-tab-pane.w--tab-active {
  display: block !important;
  animation: melloFadeIn 0.3s ease forwards;
}

/* Seating Spots Tabs & Hotspots */
.spot-tab {
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.spot-tab:hover {
  background-color: var(--white-opacity--10);
}
.spot-tab.w--current {
  background-color: var(--black) !important;
  color: var(--white) !important;
}
.spot .w-tab-pane {
  display: none;
}
.spot .w-tab-pane.w--tab-active {
  display: block !important;
  animation: melloFadeIn 0.3s ease forwards;
}
.hotspot-wrapper {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.hotspot-wrapper:hover {
  transform: scale(1.1);
}
.hotspot.active,
.hotspot.w-variant-15f52619-8149-7be7-d4da-02544603490c {
  background-color: var(--accent) !important;
  color: var(--black) !important;
  transform: scale(1.08);
  box-shadow: 0 0 0 4px var(--black);
}

/* Testimonial slider */
.testimonials-slider .w-slide {
  display: none;
}
.testimonials-slider .w-slide.active {
  display: block !important;
  animation: melloFadeIn 0.4s ease forwards;
}
.slider-button {
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.slider-button:hover {
  transform: scale(1.06);
}
.slider-button:active {
  transform: scale(0.96);
}
.slide-nav {
  display: flex !important;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}
.slide-nav .w-slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--black-opacity--10);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.slide-nav .w-slider-dot.w-active {
  background: var(--black);
  transform: scale(1.2);
}

/* Buttons & Links hover effects */
.button {
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}
.button:hover {
  transform: translateY(-2px);
}
.button:active {
  transform: translateY(1px);
}
.menu-link {
  transition: color 0.2s ease;
}
.menu-link:hover .link-background {
  opacity: 1 !important;
  transform: scale(1) !important;
}

/* Subpage styling: Catalog, Detail, About, Contact */
.mello-catalog-search {
  max-width: 580px;
  margin: 0 auto 40px;
  position: relative;
}
.mello-catalog-search input {
  width: 100%;
  padding: 16px 24px;
  border-radius: 999px;
  border: 3px solid var(--black);
  background: var(--white);
  font-family: var(--_fonts---font-family--inter);
  font-size: 16px;
  font-weight: 500;
  outline: none;
  box-shadow: 4px 4px 0 var(--black);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.mello-catalog-search input:focus {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 var(--black);
}
.mello-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 48px;
}
.mello-filter-pill {
  padding: 10px 20px;
  border-radius: 999px;
  border: 2px solid var(--black);
  background: transparent;
  font-family: var(--_fonts---font-family--inter);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mello-filter-pill.active,
.mello-filter-pill:hover {
  background: var(--black);
  color: var(--white);
}

/* Detail page */
.mello-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.mello-detail-image {
  border-radius: var(--_sizes---main-radius);
  border: 3px solid var(--black);
  box-shadow: 8px 8px 0 var(--black);
  overflow: hidden;
  background: var(--accent);
}
.mello-detail-image img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  display: block;
}
.mello-detail-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mello-detail-price {
  font-family: var(--_fonts---font-family--londrina-solid);
  font-size: 48px;
  color: var(--black);
}

/* Contact & Inquiry form */
.mello-contact-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 56px;
  align-items: start;
}
.mello-form-card {
  background: var(--white);
  border: 3px solid var(--black);
  border-radius: var(--_sizes---main-radius);
  padding: 40px;
  box-shadow: 8px 8px 0 var(--black);
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field.full, .form-status {
  grid-column: 1 / -1;
}
.field label {
  font-family: var(--_fonts---font-family--inter);
  font-size: 13px;
  font-weight: 700;
  color: var(--black);
}
.field input, .field textarea, .field select {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--black);
  background: #fafbf7;
  color: var(--black);
  font-family: var(--_fonts---font-family--inter);
  font-size: 14px;
  font-weight: 500;
  outline: none;
}
.field textarea {
  resize: vertical;
  min-height: 100px;
}
.form-grid button[type="submit"] {
  grid-column: 1 / -1;
  background: var(--black);
  color: var(--white);
  border: 2px solid var(--black);
  border-radius: 999px;
  padding: 16px 28px;
  font-family: var(--_fonts---font-family--inter);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--accent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.form-grid button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0 var(--accent);
}
.form-grid button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .info-bar-content,
  .ticker-line {
    animation: none !important;
  }
  * {
    transition: none !important;
  }
}

/* Responsive adjustments */
@media screen and (max-width: 991px) {
  .mello-detail-grid,
  .mello-contact-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
@media screen and (max-width: 767px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .mello-form-card {
    padding: 24px;
  }
}

${melloLayoutStyles}
/* Inner-page sections must not cover the absolute navigation's hit area. */
body.mello-coffee .header{z-index:20}
`;
