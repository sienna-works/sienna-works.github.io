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

			const afterHtml = data.match(/<\/html>\s*([\s\S]*)$/i)?.[1] ?? '';

			// Pull out the last <script> block from that tail
			const scriptMatch = afterHtml.match(/<script\b[^>]*>([\s\S]*?)<\/script>\s*$/i);
			const scriptText = scriptMatch?.[1] ?? '';

			// Add <script> to our <head> and remove the old one
			if (scriptText) {
				let old = document.getElementById('navPageScript');

				if (old)
					old.parentNode.removeChild(old)

				const s = document.createElement('script');
				s.id = "navPageScript";

				s.textContent = scriptText;
				document.head.appendChild(s);
			}
		});
}

function navPostFromFileName(fileName) {
	fetch('/posts.json')
		.then(r => r.json())
		.then(
			/** @param {Post[]} postData */
			postData => {
				const post = postData.find(x => x.fileName === fileName);

				if (post)
					navPost(post);
			});
}

/**
 * 
 * @param {Post} post
 */
function navPost(post) {
	fetch(`posts/${post.fileName}`)
		.then(response => response.text())
		.then(data => {
			const postText = `#### ${post.title}\n\n<span style="color:gray"><small>${formatDateLocale(new Date(new Date(post.date + ":00Z").toLocaleString()))}${post.author ? ` • ${post.author}` : ''}</small></span>\n\n---\n${data}`;
			const content = document.getElementById('content');

			content.innerHTML = marked.parse(postText);

			const moreLink = document.createElement('a');
			moreLink.innerText = "Back";
			moreLink.href = `#`;
			moreLink.onclick = () => history.back();
			content.appendChild(moreLink);
		});
}
