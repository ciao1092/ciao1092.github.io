const viewsPath = "Resources/Views";
const indexTargetId = "index";
const docTargetId = "docContent";

addEventListener("hashchange", loadfromhash);
document.body.onload = body_onLoad;

function body_onLoad() {
	setTimeout(() => {
		loadViews("home");
		loadfromhash();
	}, 340);
}

function loadfromhash() {
	var hash = window.location.hash.substring(1);
	if (hash) loadDoc(hash);
}

function htmlEntities(str) {
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function loadDoc(view) {
	var file = viewsPath + "/" + view + ".html";
	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {
		if (this.readyState == 4 /* 4 = DONE */)
			if (this.status == 200) {
				var el = document.createElement('html');
				el.innerHTML = this.responseText;
				try {
					document.title = el.getElementsByTagName('title')[0].innerText;
				} catch {
					document.title = view;
				}
				document.getElementById(docTargetId).innerHTML = this.responseText;
			} else {
				console.error(this.status);
				if (this.status == 404)
					document.getElementById(docTargetId).innerHTML =
						"<title>Not Found</title><div class=\"container mt-5\"><h2>Not Found</h2>\nThe requested view could not be found.</div>";
			}
	};

	xhr.open("GET", file, true);
	xhr.send();
	return;
}

function loadViews() {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4)
			if (this.status == 200) {
				var xml = this.responseXML;
				var index = `
								<nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top" data-bs-theme="dark">
									<div class="container">
										<a class="navbar-brand" href="#/home">ciao1092.github.io</a>
										<button class="navbar-toggler p-0 border-0" type="button" id="navbarSideCollapse" aria-label="Toggle navigation">
											<span class="navbar-toggler-icon"></span>
										</button>
										<div class="navbar-collapse offcanvas-collapse" id="navbarSupportedContent">
											<ul class="navbar-nav me-auto mb-2 mb-lg-0">
							`;

				try {
					var views = xml.getElementsByTagName("view");
					var i;
					for (i = 0; i < views.length; i++) {
						var v = views[i];
						var vPath = v.getElementsByTagName("name")[0].childNodes[0].nodeValue;
						var vText = v.getElementsByTagName("display")[0].childNodes[0].nodeValue;
						index +=
							'<li class="nav-item"><a class="nav-link" href="#/' + vPath + '">' + vText + "</a></li>";

						if (
							v.hasAttribute("default") &&
							(v.getAttribute("default") == "true" || v.getAttribute("default") == "1")
						) {
							if (!window.location.hash) loadDoc(vPath);
						}
					}
					index += `
					</ul>
				</div>
			</div>
		</nav>
		<div class="pt-4"></div>`;
					document.getElementById(indexTargetId).innerHTML = index;
					document.querySelector('#navbarSideCollapse')?.addEventListener('click', () => {
						document.querySelector('.offcanvas-collapse').classList.toggle('open');
					});
					document.querySelector('#navbarSupportedContent')?.addEventListener('click', () => {
						document.querySelector('.offcanvas-collapse').classList.toggle('open');
					});
				} catch (ex) {
					document.title = "Error";
					var html = htmlEntities(document.body.innerHTML);
					document.body.innerHTML =
						"<!-- An error occourred. This was the body before the error: \n" +
						html +
						"\n-->" +
						'<div class="container">' +
						"An error occourred: " +
						ex.message +
						"." +
						"</div>";
					throw ex;
				}
			} else {
				document.title = "Error";
				var html = htmlEntities(document.body.innerHTML);
				document.body.innerHTML =
					"<!-- An error occourred. This was the body before the error: \n" +
					html +
					"\n-->" +
					'<div class="container">' +
					"An error occourred while fetching page data from server." +
					"</div>";
				throw new Error("HTTP error: " + this.status);
			}
	};

	xhr.open("GET", viewsPath + "/index.xml");
	xhr.send();
	return;
}
