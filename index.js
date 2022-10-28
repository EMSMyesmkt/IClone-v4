//carousel
let liEls = document.querySelectorAll('ul li');
let index = 0;
window.show = function(increase) {
  index = index + increase;
  index = Math.min(Math.max(index,0), liEls.length-1);
  liEls[index].scrollIntoView({behavior: 'smooth'});
}


const loadUsers = (ref, onValue, database) => {
  const usersRef = ref(database, 'users');
  const results = [];

  return new Promise((resolve) => {
    onValue(
      usersRef,
      (users) => {
        users.forEach((u) => {
          results.push({ ...u.val(), id: u.key });
        });
        if (results.length) resolve(results);
        else resolve([]);
      },
      { onlyOnce: true }
    );
  });
};

const loadPosts = (ref, onValue, database) => {
  const postsRef = ref(database, 'posts');
  const results = [];

  return new Promise((resolve) => {
    onValue(
      postsRef,
      (posts) => {
        posts.forEach((u) => {
          results.push({ ...u.val(), id: u.key });
        });
        if (results.length) resolve(results);
        else resolve([]);
      },
      { onlyOnce: true }
    );
  });
};

const setComment = (postId, comments, ref, database, update) => {
  console.log(comments)
  const commentEl = document.querySelector(`.comment-box-${postId}`) || null
  if (commentEl) {
    const commentText = commentEl.value
    if (commentText) {
      console.log(commentText)
      const commentsTemp = JSON.parse(atob(comments)) || []
      commentsTemp.push({
        user: {
          email: 'undefined'
        },
        text: commentText,
        createdAt: new Date().toISOString()
      })
      return update(ref(database, `posts/${postId}`), { comments: commentsTemp }).then(() => {
        commentEl.value = ''
      })
    } else {
      alert('Write a comment before sending.')
      return Promise.reject('There is no text.')
    }
  } return Promise.reject('There is no element.')
}

const loadComments = (ref, onValue, database) => {
  const commentsRef = ref(database, 'comments');
  const appearing = [];

  return new Promise((resolve) => {
    onValue(
      commentsRef,
      (comments) => {
        comments.forEach((u) => {
          appearing.push({ ...u.val(), id: u.key });
        });
        if (appearing.length) resolve(appearing);
        else resolve([]);
      },
      { onlyOnce: true }
    );
  });
};

const renderComments = (comments) => {
  const commentHtml = `<p class="description"><span>__USERNAME__</span>__TEXT__, __TIMELAPSED__</p>`;
  let html = '';

  /*
    {
      text: 'xcvahcvan',
      createdAt: '', //.toISOString()
      user: {
        ...
      }
    }l
  */

  for (const com of comments) {
    const datePost = new Elapsed(new Date(com.createdAt), new Date());
    html += commentHtml
      .replace('__USERNAME__', com.user.email)
      .replace('__TIMELAPSED__', datePost.optimal)
      .replace('__TEXT__', com.text);
  }
  return html;
};

const loadNavbarLogin = () => {
  const postnavbar = `<img src="__PROFILE_PIC__" class="icon user-profile" alt="" id="profile_pic">
  
    <div class="right-col">
      <div class="profile-card">
      <div class="profile-pic">
        <img src="__PROFILE_PIC__">
      </div>
      <div>
        <p class="username">__USERNAME__</p>
      </div>`;

  const user = sessionStorage.getItem('user');
  let html = '';

  if (user) {
    const temp = JSON.parse(user)
    console.log(temp.image)
    html = postnavbar
      .replace(new RegExp('__PROFILE_PIC__', 'g'), temp.image)
      .replace('__USERNAME__', temp.email);
  } else {
    window.location.href = 'login.html';
  }

  return html;
};

const renderPosts = (posts) => {
  const postHtml = `<div class="one-post">
  <div class="post">
    <div class="info">
      <div class="user">
        <div class="profile-pic-1"><img src="__PROFILE_PIC__" alt=""></div>
        <p class="username">__USERNAME__</p>
      </div>
      <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Foption.PNG?alt=media&token=2120365a-988a-4a09-b4bf-ad76dba65430" class="options" alt="">
    </div>
  </div>
  <img src="__POST_IMAGE__" class="post-image" alt="">
  <div class="post-content">
    <div class="reaction-wrapper">
      <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Flike.PNG?alt=media&token=f6511888-aeee-4d75-b64f-750c5bc8f965" class="icon" alt="">
      <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Fcomment.PNG?alt=media&token=6c76a261-bd4e-4368-8cfd-79df59505bea" class="icon" alt="">
      <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Fsend.PNG?alt=media&token=7757de15-421d-46c8-855f-0fe519f04494" class="icon" alt="">
      <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Fsave.PNG?alt=media&token=ee498710-0161-45dd-a0dd-a29d35613eb9" class="save icon" alt="">
    </div>

    <p class="likes">__LIKES__ likes</p>
    __POST_TEXT__
    __COMMENTS__
    <p class="post-time">__TIME_ELAPSED__</p>
  </div>

  <div class="comment-wrapper">
    <img src="https://firebasestorage.googleapis.com/v0/b/i-clone-database.appspot.com/o/img%2Fcover%201.jpeg?alt=media&token=f17aec73-cd2a-43de-826c-35c1e16e974d" class="icon" alt="">
    <input type="text" class="comment-box comment-box-__POST_ID__" placeholder="Enter comment" data-postid="__POST_ID__">
    <button class="comment-btn" data-postid="__POST_ID__" data-comments="__POST_COMMENTS__">Post</button>
  </div>
</div>`;

  let html = '';

  for (const post of posts) {
    const datePost = new Elapsed(new Date(post.createdAt), new Date());
    html += postHtml
      .replace('__PROFILE_PIC__', post.user.image)
      .replace('__USERNAME__', post.user.email)
      .replace('__POST_IMAGE__', post.image)
      .replace('__LIKES__', post.likes)
      .replace(new RegExp('__POST_ID__', 'g'), post.id) /* expressão regular, com flag "g", que executa em todas as ocorrências */
      .replace('__POST_COMMENTS__', btoa(JSON.stringify(post.comments || [])))
      .replace(
        '__POST_TEXT__',
        renderComments([{ user: post.user, text: post.text }])
      )
      .replace('__COMMENTS__', renderComments(post.comments || []))
      .replace('__TIME_ELAPSED__', datePost.optimal);
  }

  return html;
};

const initApp = (ref, onValue, database, update) => {
  loadPosts(ref, onValue, database).then(posts => {
    const postsEl = document.querySelector('.posts');
    postsEl.innerHTML = renderPosts(posts);
    document.querySelector('.user-profile').innerHTML = loadNavbarLogin()
    // adicionar um delay
    setTimeout(() => {
      document.querySelector('body').addEventListener('click', e => {
        if (e.target.className === 'comment-btn')
          setComment(e.target.dataset.postid, e.target.dataset.comments, ref, database, update).then(() => initApp(ref, onValue, database, update))
      })
    }, 500)
  })
}