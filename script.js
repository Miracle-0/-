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
    // 获取地图的当前尺寸（缩放后的实际尺寸）
    const mapWidth = mapElement.offsetWidth;
    const mapHeight = mapElement.offsetHeight;

    // 获取地图容器的尺寸
    const containerWidth = mapContainer.offsetWidth;
    const containerHeight = mapContainer.offsetHeight;

    // 遍历每个标记点
    markers.forEach(marker => {
        // 获取标记点在地图上的原始百分比位置
        const xPercent = parseFloat(marker.getAttribute('data-x'));  // 横向百分比
        const yPercent = parseFloat(marker.getAttribute('data-y'));  // 纵向百分比

        // 计算标记点在地图上的实际像素位置（相对缩放后的地图尺寸）
        let markerX = (xPercent / 100) * mapWidth;
        let markerY = (yPercent / 100) * mapHeight;

        // 计算相对于当前视图窗口的偏移量
        markerX += currentX;  // 考虑地图拖动的X偏移
        markerY += currentY;  // 考虑地图拖动的Y偏移

        // 限制标记点的显示范围，防止超出视口
        if (markerX >= 0 && markerX <= containerWidth && markerY >= 0 && markerY <= containerHeight) {
            // 标记点在可见范围内，更新其位置
            marker.style.left = `${markerX}px`;
            marker.style.top = `${markerY}px`;
            marker.style.display = 'block';  // 确保标记点显示
        } else {
            // 标记点在不可见区域，隐藏它
            marker.style.display = 'none';
        }
    });
}



// 处理地图的缩放
mapElement.addEventListener('wheel', function(event) {
    event.preventDefault();
    const scaleStep = 0.1;  // 每次缩放的步长
    const oldScale = scale;  // 缓存缩放前的比例

    if (event.deltaY < 0) {
        scale = Math.min(scale + scaleStep, 3);  // 最大放大到3倍
    } else {
        scale = Math.max(scale - scaleStep, 1);  // 最小缩小到原图比例
    }

    // 更新位移以保持地图中心不发生明显变化
    const rect = mapElement.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) * (1 - oldScale / scale);
    const offsetY = (event.clientY - rect.top) * (1 - oldScale / scale);

    currentX -= offsetX;
    currentY -= offsetY;

    // 应用缩放和位移
    mapElement.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;

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

        // 限制地图不能拖动超出容器边界
        const maxX = (containerRect.width * (scale - 1)) / 2;
        const maxY = (containerRect.height * (scale - 1)) / 2;

        newX = Math.max(-maxX, Math.min(newX, maxX));
        newY = Math.max(-maxY, Math.min(newY, maxY));

        // 更新当前位移并应用变换
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
document.getElementById('point1').addEventListener('click', function() {
    document.getElementById('title').innerText = "南大门";
    changeImage("south.jpg", "这是建筑点位1的详细信息。");
});

document.getElementById('point2').addEventListener('click', function() {
    document.getElementById('title').innerText = "主图书馆";
    changeImage("library.jpg", "这是建筑点位2的详细信息。");
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
