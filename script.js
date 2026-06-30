// mobile nav toggle
const navToggle=document.querySelector('.nav-toggle');
const navLinks=document.querySelector('.nav-links');
if(navToggle&&navLinks){
  navToggle.addEventListener('click',()=>{
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// nav active link on scroll
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click',()=>{
    document.querySelectorAll('.nav-links a').forEach(l=>l.classList.remove('active'));
    a.classList.add('active');
  });
});

// 3D tilt on project cards — skip on touch devices
const supportsHover=window.matchMedia('(hover:hover)').matches;
if(supportsHover){
  document.querySelectorAll('.card-inner').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      card.style.transform=`rotateY(${x*8}deg) rotateX(${-y*8}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='rotateY(0) rotateX(0)'});
  });
}

// project modal (data-* attrs on card)
const modalBg=document.getElementById('modalBg');
if(modalBg){
  document.querySelectorAll('.card-inner').forEach(card=>{
    card.addEventListener('click',()=>{
      modalBg.querySelector('.m-title').textContent=card.dataset.title;
      modalBg.querySelector('.m-date').textContent=card.dataset.date;
      modalBg.querySelector('.m-summary').textContent=card.dataset.summary;
      modalBg.querySelector('.m-tech').textContent=card.dataset.tech;
      modalBg.classList.add('open');
    });
  });
  modalBg.addEventListener('click',e=>{ if(e.target===modalBg) modalBg.classList.remove('open'); });
  document.querySelector('.modal-close')?.addEventListener('click',()=>modalBg.classList.remove('open'));
}
