class MauGallery {


  constructor(element, options = {}) {  // Changé de 'selector' à 'element'
    this.gallery = element;  // Utilisez directement l'élément
    if (!this.gallery) return;

    this.options = Object.assign({
      columns: 3,
      lightBox: true,
      lightboxId: 'galleryLightbox',
      showTags: true,
      tagsPosition: 'bottom',
      navigation: true,
    }, options);

    this.tagsCollection = [];
    this.init();

  // constructor(selector, options = {}) {
  //   this.gallery = document.querySelector(selector);
  //   if (!this.gallery) return;

  //   this.options = Object.assign({
  //     columns: 3,
  //     lightBox: true,
  //     lightboxId: 'galleryLightbox',
  //     showTags: true,
  //     tagsPosition: 'bottom',
  //     navigation: true,
  //   }, options);

  //   this.tagsCollection = [];

  //   this.init();



  }

  init() {
    this.createRowWrapper();
    if (this.options.lightBox) {
      this.createLightBox();
    }

    this.setupListeners();

    const items = this.gallery.querySelectorAll('.gallery-item');
    items.forEach(item => {
      this.responsiveImageItem(item);
      this.moveItemInRowWrapper(item);
      this.wrapItemInColumn(item, this.options.columns);

      const tag = item.dataset.galleryTag;
      if (this.options.showTags && tag && !this.tagsCollection.includes(tag)) {
        this.tagsCollection.push(tag);
      }
    });

    if (this.options.showTags) {
      this.showItemTags();
    }

    this.gallery.style.display = 'block';
    this.gallery.style.opacity = 0;
    setTimeout(() => this.gallery.style.opacity = 1, 100);
  }

  createRowWrapper() {
    if (!this.gallery.querySelector('.gallery-items-row')) {
      const row = document.createElement('div');
      row.className = 'gallery-items-row row';
      this.gallery.appendChild(row);
    }
  }

  wrapItemInColumn(item, columns) {
    let columnDiv = document.createElement('div');
    columnDiv.classList.add('item-column', 'mb-4');

    if (typeof columns === 'number') {
      columnDiv.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else if (typeof columns === 'object') {
      if (columns.xs) columnDiv.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
      if (columns.sm) columnDiv.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
      if (columns.md) columnDiv.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
      if (columns.lg) columnDiv.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
      if (columns.xl) columnDiv.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else {
      console.error("Invalid columns configuration");
    }

    item.parentNode.replaceChild(columnDiv, item);
    columnDiv.appendChild(item);
  }

  moveItemInRowWrapper(item) {
    const wrapper = this.gallery.querySelector('.gallery-items-row');
    wrapper.appendChild(item.closest('.item-column') || item);
  }

  responsiveImageItem(item) {
    if (item.tagName === 'IMG') {
      item.classList.add('img-fluid');
    }
  }

  createLightBox() {
    const lightboxId = this.options.lightboxId || 'galleryLightbox';
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = lightboxId;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body position-relative">
            ${this.options.navigation ? `<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>` : ''}
            <img class="lightboxImage img-fluid" alt="Image dans la lightbox">
            ${this.options.navigation ? `<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">&gt;</div>` : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setupListeners() {
    this.gallery.addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-item') && this.options.lightBox && e.target.tagName === 'IMG') {
        this.openLightBox(e.target);
      }
    });

    this.gallery.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link')) {
        this.filterByTag(e.target);
      } else if (e.target.classList.contains('mg-prev')) {
        this.prevImage();
      } else if (e.target.classList.contains('mg-next')) {
        this.nextImage();
      }
    });
  }

  openLightBox(img) {
    const modal = document.getElementById(this.options.lightboxId);
    const lightboxImage = modal.querySelector('.lightboxImage');
    lightboxImage.src = img.src;
    new bootstrap.Modal(modal).show();
  }

  prevImage() {
    this.navigateImage(-1);
  }

  nextImage() {
    this.navigateImage(1);
  }

  navigateImage(direction) {
    const currentSrc = document.querySelector('.lightboxImage').src;
    const activeTag = document.querySelector('.tags-bar .active-tag')?.dataset.imagesToggle || 'all';
    const images = Array.from(this.gallery.querySelectorAll('img.gallery-item')).filter(img => {
      return activeTag === 'all' || img.dataset.galleryTag === activeTag;
    });

    const currentIndex = images.findIndex(img => img.src === currentSrc);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + direction + images.length) % images.length;
    document.querySelector('.lightboxImage').src = images[nextIndex].src;
  }

  showItemTags() {
    const tagsBar = document.createElement('ul');
    tagsBar.className = 'my-4 tags-bar nav nav-pills';

    const allTag = document.createElement('li');
    allTag.className = 'nav-item';
    allTag.innerHTML = `<span class="nav-link active-tag" data-images-toggle="all">Tous</span>`;
    tagsBar.appendChild(allTag);

    this.tagsCollection.forEach(tag => {
      const tagItem = document.createElement('li');
      tagItem.className = 'nav-item';
      tagItem.innerHTML = `<span class="nav-link" data-images-toggle="${tag}">${tag}</span>`;
      tagsBar.appendChild(tagItem);
    });

    if (this.options.tagsPosition === 'top') {
      this.gallery.prepend(tagsBar);
    } else {
      this.gallery.append(tagsBar);
    }
  }

  filterByTag(tagElement) {
    document.querySelectorAll('.tags-bar .nav-link').forEach(el => el.classList.remove('active-tag'));
    tagElement.classList.add('active-tag');

    const selectedTag = tagElement.dataset.imagesToggle;

    this.gallery.querySelectorAll('.gallery-item').forEach(item => {
      const column = item.closest('.item-column');
      if (!column) return;

      if (selectedTag === 'all' || item.dataset.galleryTag === selectedTag) {
        column.style.display = '';
      } else {
        column.style.display = 'none';
      }
    });
  }
}
