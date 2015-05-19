/*
 File drag and drop uploads
 */

var $ = require('jquery'),
	main = require('./main'),
	state = main.state;

function dragonDrop(e) {
	e.stopPropagation();
	e.preventDefault();
	let files = e.dataTransfer.files;
	if (!files.length)
		return;
	if (!main.postForm) {
		main.command('scroll:followLock', function() {
			const thread = state.page.get('thread');
			if (thread)
				main.openPostBox(thread);
			else {
				let $s = $(e.target).closest('section');
				if (!$s.length)
					return;
				main.openPostBox($s.attr('id'));
			}
		});
	}
	else {
		let attrs = main.postForm.model.attributes;
		if (attrs.uploading || attrs.uploaded)
			return;
	}

	if (files.length > 1) {
		main.postForm.uploadError('Too many files.');
		return;
	}

	// Drag and drop does not supply a fakepath to file, so we have to use
	// a separate upload form from the postForm one. Meh.
	const extra = main.postForm.prepareUpload();
	let fd = new FormData();
	fd.append('image', files[0]);
	for (var k in extra)
		fd.append(k, extra[k]);
	// Can't seem to jQuery this shit
	let xhr = new XMLHttpRequest();
	xhr.open('POST', main.request('imageUploadURL'));
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onreadystatechange = upload_shita;
	xhr.send(fd);

	main.postForm.notifyUploading();
}

function upload_shita() {
	if (this.readyState != 4 || this.status == 202)
		return;
	const err = this.responseText;
	// Everything just fine. Don't need to report.
	if (!/legitimate imager response/.test(err))
		main.postForm.uploadError(err);
}

function stop_drag(e) {
	e.stopPropagation();
	e.preventDefault();
}

function setupUploadDrop(e) {
	function go(nm, f) { e.addEventListener(nm, f, false); }
	go('dragenter', stop_drag);
	go('dragexit', stop_drag);
	go('dragover', stop_drag);
	go('drop', dragonDrop);
}

$(function () {
	setupUploadDrop(document.body);
});
