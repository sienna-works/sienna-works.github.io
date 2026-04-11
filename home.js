// Get current page from ?page=... or default to 1
function getPageFromUrl() {
    const url = new URL(window.location.href);
    const page = url.searchParams.get('page');
    return page ? Math.max(1, parseInt(page, 10)) : 1;
}

// Update URL without reloading (e.g. when clicking buttons)
function setPage(page) {
    const url = new URL(window.location.href);
    if (page === 1) {
        url.searchParams.delete('page');
    } else {
        url.searchParams.set('page', page);
    }
    window.history.pushState({}, '', url.toString());
}

// Sorts posts by date desc
const postSorter = (a, b) => {
    const ad = new Date(a.date);
    const bd = new Date(b.date);

    return ad > bd ? -1 : ad < bd ? 1 : 0;
};

function formatDateLocale(date) {
    const locale = navigator.language || 'en-US';

    // Format date part (consistent across locales)
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const dateParts = dateFormatter.formatToParts(date);
    const year = dateParts.find(p => p.type === 'year').value;
    const month = dateParts.find(p => p.type === 'month').value;
    const day = dateParts.find(p => p.type === 'day').value;
    const dateStr = `${year}-${month}-${day}`;

    // Format time part (locale-aware: 24h or 12h+AM/PM)
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: undefined  // Uses locale default
    });
    const timeStr = timeFormatter.format(date);

    return `${dateStr} ${timeStr}`;
}

function createPaginationButtons(numPosts) {
    const el = document.getElementById('pagination');
    el.innerHTML = '';

    const currentPage = getPageFromUrl();
    const totalPages = Math.ceil(numPosts / _postsPerPage);

    // Previous button
    const prev = document.createElement('li');
    prev.innerHTML = `<a href="#" class="page-link ${currentPage === 1 ? 'disabled' : ''}">Previous</a>`;
    if (currentPage > 1) {
        prev.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            setPage(currentPage - 1);
            window.location.reload();
        });
    }
    el.appendChild(prev);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" class="page-link ${currentPage === i ? 'active' : ''}">${i}</a>`;
        if (i !== currentPage) {
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                setPage(i);
                window.location.reload();
            });
        }
        el.appendChild(li);
    }

    // Next button
    const next = document.createElement('li');
    next.innerHTML = `<a href="#" class="page-link ${currentPage === totalPages ? 'disabled' : ''}">Next</a>`;
    if (currentPage < totalPages) {
        next.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            setPage(currentPage + 1);
            window.location.reload();
        });
    }
    el.appendChild(next);
}

function fetchPosts() {
    const _content = document.getElementById('content');
    const _postsPerPage = 5;

    fetch('/posts.json')
        .then(r => r.json())
        .then(postData => {
            const posts = [];
            const fetchPromises = [];

            // Pagination logic
            const currentPage = getPageFromUrl();
            const numPosts = postData.length;
            const numPages = Math.ceil(numPosts / _postsPerPage);

            const start = (currentPage - 1) * _postsPerPage;
            const end = start + _postsPerPage;

            // Sort all posts by date desc
            postData.sort(postSorter);

            // Grab slice of current page (already sorted)
            const pagePosts = postData.slice(start, end);

            // Get paginated posts' text and metadata
            for (let i = 0; i < pagePosts.length; i++) {
                const post = pagePosts[i];
                fetchPromises.push(
                    fetch('posts/' + post.fileName)
                        .then(res => res.text())
                        .then(text => {
                            posts.push({ title: post.title, author: post.author, date: post.date, text: text });
                        }));
            }

            Promise.all(fetchPromises)
                .then(() => {
                    // Sort again, as `posts` may have been fetched out-of-order
                    posts.sort(postSorter);

                    // Remove 'Loading...'
                    _content.innerHTML = '';

                    // Render posts made for a single page
                    for (let i = 0; i < posts.length; i++) {
                        const post = posts[i];

                        // Initialize post text with title and date
                        const postText = `#### ${post.title}\n\n<span style="color:gray"><small>${formatDateLocale(new Date(post.date))}${post.author ? ` • ${post.author}` : ''}</small></span>\n\n---\n${post.text}`;

                        const newDiv = document.createElement('div');
                        newDiv.style.marginBottom = '40px';
                        newDiv.innerHTML = marked.parse(postText);

                        _content.appendChild(newDiv);
                    }

                    if (numPosts > 0)
                        createPaginationButtons(numPosts);
                });
        });
}