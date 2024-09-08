let scale = 1;  // 初始缩放比例为1
let isDragging = false;  // 用于标识是否正在拖动
let startX, startY, currentX = 0, currentY = 0;  // 拖动的起始点和当前位移

const mapElement = document.getElementById('map');
const mapContainer = document.querySelector('.map-container');
const markers = document.querySelectorAll('.marker');

// 获取地图容器的宽高，用于限制地图移动范围
const containerRect = mapContainer.getBoundingClientRect();

// 禁用地图图片的拖拽行为
mapElement.setAttribute('draggable', false);

// 更新标记点位置的函数
function updateMarkersPosition() {
    // 获取缩放后的地图尺寸
    const mapWidth = mapElement.offsetWidth;
    const mapHeight = mapElement.offsetHeight;

    // 遍历每个标记点
    markers.forEach(marker => {
        // 获取标记点在地图上的百分比位置
        const xPercent = parseFloat(marker.getAttribute('data-x'));
        const yPercent = parseFloat(marker.getAttribute('data-y'));

        // 计算标记点在缩放后地图上的实际像素位置
        let markerX = (xPercent / 100) * mapWidth;
        let markerY = (yPercent / 100) * mapHeight;

        // 考虑地图的当前位移
        markerX += currentX;
        markerY += currentY;

        // 更新标记点的绝对位置
        marker.style.left = `${markerX}px`;
        marker.style.top = `${markerY}px`;
    });
}

// 显示或隐藏标记点的函数
function toggleMarkersVisibility() {
    markers.forEach(marker => {
        if (scale === 1) {
            marker.style.display = 'block';  // 显示标记点
        } else {
            marker.style.display = 'none';  // 隐藏标记点
        }
    });
}

// 地图居中函数，当 scale 为 1 时使用
function centerMap() {
    const mapWidth = mapElement.offsetWidth;
    const mapHeight = mapElement.offsetHeight;
    const containerWidth = mapContainer.offsetWidth;
    const containerHeight = mapContainer.offsetHeight;

    // 计算地图初始居中的偏移量
    currentX = (containerWidth - mapWidth) / 2;
    currentY = (containerHeight - mapHeight) / 2;

    // 应用居中位移
    mapElement.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;

    // 更新标记点位置并检查可见性
    updateMarkersPosition();
    toggleMarkersVisibility();
}

// 初始状态时地图居中
window.addEventListener('load', centerMap);

// 处理地图的缩放
mapElement.addEventListener('wheel', function(event) {
    event.preventDefault();
    const scaleStep = 0.1;  // 缩放的步长
    const oldScale = scale;  // 缓存缩放前的比例

    // 根据鼠标滚轮调整缩放
    if (event.deltaY < 0) {
        scale = Math.min(scale + scaleStep, 3);  // 最大放大到3倍
    } else {
        scale = Math.max(scale - scaleStep, 1);  // 最小缩小到原始大小
    }

    // 获取当前鼠标位置，计算缩放中心的偏移
    const rect = mapElement.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) * (1 - oldScale / scale);
    const offsetY = (event.clientY - rect.top) * (1 - oldScale / scale);

    // 更新位移，保持缩放时的地图中心不变化
    currentX -= offsetX;
    currentY -= offsetY;

    // 当缩放比例为 1 时，将地图居中
    if (scale === 1) {
        centerMap();
    } else {
        // 否则更新缩放和位移
        mapElement.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
        toggleMarkersVisibility();
    }

    // 更新标记点位置
    updateMarkersPosition();
});

// 处理地图的拖动
mapContainer.addEventListener('mousedown', function(event) {
    isDragging = true;
    startX = event.clientX - currentX;
    startY = event.clientY - currentY;
    mapContainer.style.cursor = 'grabbing';
    event.preventDefault();
});

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        // 计算新的位移
        let newX = event.clientX - startX;
        let newY = event.clientY - startY;

        // 限制地图拖动的范围，确保地图不会超出视口范围
        const maxX = (containerRect.width * (scale - 1)) / 2;
        const maxY = (containerRect.height * (scale - 1)) / 2;

        // 确保位移不会超过设定范围
        newX = Math.max(-maxX, Math.min(newX, maxX));
        newY = Math.max(-maxY, Math.min(newY, maxY));

        // 更新当前位移并应用
        currentX = newX;
        currentY = newY;
        mapElement.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;

        // 更新标记点位置
        updateMarkersPosition();
    }
});

document.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    }
});

document.addEventListener('mouseleave', function() {
    if (isDragging) {
        isDragging = false;
        mapContainer.style.cursor = 'grab';
    }
});

// 初始化标记点位置
updateMarkersPosition();

// 处理标记点点击事件
markers.forEach(marker => {
    marker.addEventListener('click', function() {
        const pointId = this.id;
        const title = pointId === 'point1' ? '南大门' : '主图书馆';
        const imageSrc = pointId === 'point1' ? 'south.jpg' : 'library.jpg';
        const description = pointId === 'point1' ? '这是建筑点位1的详细信息。' : '这是建筑点位2的详细信息。';

        document.getElementById('title').innerText = title;
        changeImage(imageSrc, description);
    });
});

// 图片切换函数，带有淡入淡出效果
function changeImage(newSrc, newDescription) {
    var imageElement = document.getElementById('image');
    var descriptionElement = document.getElementById('description');

    // 先将图片淡出
    imageElement.style.opacity = 0;

    // 在500ms后，切换图片并重新淡入
    setTimeout(function() {
        imageElement.src = newSrc;

        imageElement.onload = function() {
            imageElement.style.opacity = 1;  // 图片加载完成后重新显示
        };

        descriptionElement.innerText = newDescription;  // 更新描述文字
    }, 500);
}
