function nav() {
	fetch('navbar.html')
		.then(response => response.text())
		.then(data => {
			document.getElementById('navbar-container').innerHTML = data;

			// Highlight current page (update href matches)
			const currentPage = window.location.hash ? window.location.hash : '#home';
			const links = document.querySelectorAll('.nav-link');

			links.forEach(link => {
				if (link.getAttribute('href') === currentPage) {
					link.classList.add('active');
				}
			});
		});
}

/**
 * 
 * @param {string} fileName 
 */
function navPage(fileName) {
	fetch(fileName)
		.then(response => response.text())
		.then(data => {
			document.getElementById('content').innerHTML = data;

			const currentPage = fileName.substring(0, fileName.indexOf('.')).toLowerCase();
			const links = document.querySelectorAll('.nav-link');

			// Highlight page
			for (const link of links) {
				if (link.id === currentPage) {
					link.classList.add('active');
				} else {
					link.classList.remove('active');
				}
			}
		});
}

function home() {
	navPage('home.html');
	fetchPosts();
}