let data
let dataAll

let centerX = 12.34
let centerY = 45.436

let mapX
let mapY

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var popupIndex

let newfeatures = []

let map
let layer

let years = []
let yearTargets = []
let groupTargets = []
let storeTargets = []

let allYears = []
let allGroups = []
let allStores = []

let init;

function setFilterBaselines(){
  for (let i = 0; i < data.length; i++){
    for (let j = 0; j < data[i].info.length; j++){
      if (data[i].info[j].year_collected != "" && !allYears.includes(data[i].info[j].year_collected)){
        allYears.push(String(data[i].info[j].year_collected))
      }
      if (data[i].info[j].group_type != "" && !allGroups.includes(data[i].info[j].group_type)){
        allGroups.push(data[i].info[j].group_type)
      }
      if (data[i].info[j].store_type != "" && !allStores.includes(data[i].info[j].store_type)){
        allStores.push(data[i].info[j].store_type)
      }
    }
  }
}

function setFeatures() {
  newfeatures = []
  for (let i = 0; i < data.length; i++) {
    if (data[i].info.length !== 0) {
      let next = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([data[i].lng, data[i].lat])),
        _id: data[i]._id,
        info: data[i].info
      })
      newfeatures.push(next)
    }
  }
}

function setPopup() {
  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
}

function setMap() {
  map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults({ attribution: false }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA#1.07/0/0'
        })
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([centerX, centerY]),
      zoom: 14.8
    })
  });

  addLayer();

  map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) {
      let pointInfo = map.getFeaturesAtPixel(event.pixel)[0].A
      popupIndex = pointInfo.info.length - 1
      setContent(pointInfo)

      overlay.setOffset([-200, -300])
      overlay.setPosition(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'))
    } else {
      overlay.setPosition(undefined);
      closer.blur();
    }
  });

  map.on('moveend', function (e) {
    closer.blur();

    mapX = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[0]
    mapY = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')[1]

    if (mapX < 12.2915) { mapX = 12.2915 }
    if (mapX > 12.379) { mapX = 12.379 }
    if (mapY > 45.453) { mapY = 45.453 }
    if (mapY < 45.425) { mapY = 45.415 }

    map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));

    if (map.getView().getZoom() < 14.5) {
      map.getView().setZoom(14.5)
      map.getView().setCenter(ol.proj.transform([centerX, centerY], 'EPSG:4326', 'EPSG:3857'));
    }
    if (map.getView().getZoom() > 21) {
      map.getView().setZoom(21)
      map.getView().setCenter(ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857'));
    }
  });

  var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });
  map.addOverlay(overlay);
}

function addLayer() {
  layer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: newfeatures
    })
  });
  map.addLayer(layer);
}

function setContent(pointInfo) {
  content.innerHTML = ""

  let information = pointInfo.info
  let currInfo = information[popupIndex]

  const editButton = document.createElement("button");
  editButton.innerHTML = '<img src="./assets/pencil.png"/>'
  editButton.id = 'editButton'
  editButton.onclick = function() {
    content.innerHTML = ""

    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("width", "200px")
    imagePreview.setAttribute("height", "200px")
    imagePreview.setAttribute("src", currInfo.image_url)
    content.appendChild(imagePreview)
    const imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.setAttribute("accept", "image/png, image/jpeg")
    imageInput.setAttribute("id", "imageInput")
    imageInput.onchange = function() {
      imagePreview.setAttribute("src", URL.createObjectURL(imageInput.files[0]))
    }
    content.appendChild(imageInput)
    content.appendChild(document.createElement("br"))

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Store Name:"
    content.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    content.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function (){ nameInput.value = "" }
    content.appendChild(clearName)
    content.appendChild(document.createElement("br"))

    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year Collected:"
    content.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = currInfo.year_collected
    content.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function (){ yearInput.value = "" }
    content.appendChild(clearYear)
    content.appendChild(document.createElement("br"))

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Store store:"
    content.appendChild(storeLabel)
    const storeInput = document.createElement("input")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    storeInput.value = currInfo.store_type
    content.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function (){ storeInput.value = "" }
    content.appendChild(clearStore)
    content.appendChild(document.createElement("br"))

    const groupLabel = document.createElement("label")
    groupLabel.setAttribute("for", "groupInput")
    groupLabel.innerText = "Store group:"
    content.appendChild(groupLabel)
    const groupInput = document.createElement("input")
    groupInput.setAttribute("id", "groupInput")
    groupInput.setAttribute("name", "groupInput")
    groupInput.value = currInfo.group_type
    content.appendChild(groupInput)
    const clearGroup = document.createElement("button")
    clearGroup.innerText = "Clear"
    clearGroup.onclick = function (){ groupInput.value = "" }
    content.appendChild(clearGroup)
    content.appendChild(document.createElement("br"))

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.onclick = function() { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.onclick = function() { 
      if (imageInput.files.length === 0){
        alert("Every data point must include a picture")
      }
      else if (isNaN(yearInput.value)){
        alert("Year Collected must be a number")
      } 
      else{
        const addedJSON = {
          _id: pointInfo._id,
          index: popupIndex,
          info: information,
          name: nameInput.value,
          image: imagePreview.src,
          year: parseInt(yearInput.value, 10),
          store: storeInput.value,
          group: groupInput.value
        }

        fetch("/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addedJSON)
        })
          .then(function() {
            const savedId = pointInfo._id
            let savedInfo;
            const editing = new Promise((request, response) => {
              map.removeLayer(layer)
              fetch("/load", {
                method: "GET"
              })
                .then(function (response) {
                  return response.json()
                })
                .then(function (json) {
                  data = json
                  dataAll = JSON.parse(JSON.stringify(data))
                  return data
                })
                .then(function (data) {
                  setFilterBaselines()
                  setFeatures()
                  setPopup()
                  addLayer()
                  setYearFilter()
                  setGroupFilter()
                  setStoreFilter()
                  return 0
                  })
                .then(function() {
                  for (let i = 0; i < newfeatures.length; i++){
                    if (newfeatures[i].A._id === savedId)
                      savedInfo = newfeatures[i].A
                  }
                  setContent(savedInfo)
                  return 0
                  })
            })
            return 0
          })
      }
    }
    content.appendChild(submitButton)
  }
  content.appendChild(editButton)

  const plusButton = document.createElement("button")
  plusButton.innerHTML = '<img src="./assets/plus.png"/>'
  plusButton.onclick = function() {
    content.innerHTML = ""

    const imagePreview = document.createElement("img")
    imagePreview.setAttribute("width", "200px")
    imagePreview.setAttribute("height", "200px")
    content.appendChild(imagePreview)
    const imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.setAttribute("accept", "image/png, image/jpeg")
    imageInput.setAttribute("id", "imageInput")
    imageInput.onchange = function() {
      imagePreview.setAttribute("src", URL.createObjectURL(imageInput.files[0]))
    }
    content.appendChild(imageInput)
    content.appendChild(document.createElement("br"))

    const nameLabel = document.createElement("label")
    nameLabel.setAttribute("for", "nameInput")
    nameLabel.innerText = "Store Name:"
    content.appendChild(nameLabel)
    const nameInput = document.createElement("input")
    nameInput.setAttribute("id", "nameInput")
    nameInput.setAttribute("name", "nameInput")
    nameInput.value = currInfo.store_name
    content.appendChild(nameInput)
    const clearName = document.createElement("button")
    clearName.innerText = "Clear"
    clearName.onclick = function (){ nameInput.value = "" }
    content.appendChild(clearName)
    content.appendChild(document.createElement("br"))
    
    const yearLabel = document.createElement("label")
    yearLabel.setAttribute("for", "yearInput")
    yearLabel.innerText = "Year Collected:"
    content.appendChild(yearLabel)
    const yearInput = document.createElement("input")
    yearInput.setAttribute("id", "yearInput")
    yearInput.setAttribute("name", "yearInput")
    yearInput.value = new Date().getFullYear()
    content.appendChild(yearInput)
    const clearYear = document.createElement("button")
    clearYear.innerText = "Clear"
    clearYear.onclick = function (){ yearInput.value = "" }
    content.appendChild(clearYear)
    content.appendChild(document.createElement("br"))

    const storeLabel = document.createElement("label")
    storeLabel.setAttribute("for", "storeInput")
    storeLabel.innerText = "Store store:"
    content.appendChild(storeLabel)
    const storeInput = document.createElement("input")
    storeInput.setAttribute("id", "storeInput")
    storeInput.setAttribute("name", "storeInput")
    storeInput.value = currInfo.store_type
    content.appendChild(storeInput)
    const clearStore = document.createElement("button")
    clearStore.innerText = "Clear"
    clearStore.onclick = function (){ storeInput.value = "" }
    content.appendChild(clearStore)
    content.appendChild(document.createElement("br"))

    const groupLabel = document.createElement("label")
    groupLabel.setAttribute("for", "groupInput")
    groupLabel.innerText = "Store group:"
    content.appendChild(groupLabel)
    const groupInput = document.createElement("input")
    groupInput.setAttribute("id", "groupInput")
    groupInput.setAttribute("name", "groupInput")
    groupInput.value = currInfo.group_type
    content.appendChild(groupInput)
    const clearGroup = document.createElement("button")
    clearGroup.innerText = "Clear"
    clearGroup.onclick = function (){ groupInput.value = "" }
    content.appendChild(clearGroup)
    content.appendChild(document.createElement("br"))

    const cancelButton = document.createElement("button")
    cancelButton.innerText = "cancel"
    cancelButton.classList.add("scrollButton")
    cancelButton.onclick = function() { setContent(pointInfo) }
    content.appendChild(cancelButton)

    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList.add("scrollButton")
    submitButton.onclick = function() { 
      if (imageInput.files.length === 0){
        alert("Every data point must include a picture")
      }
      else if (isNaN(yearInput.value)){
        alert("Year Collected must be a number")
      } 
      else{
        const addedJSON = {
          _id: pointInfo._id,
          info: information,
          name: nameInput.value,
          image: imagePreview.src,
          year: yearInput.value,
          store: storeInput.value,
          group: groupInput.value
        }

        fetch("/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addedJSON)
        })
          .then(function() {
            const savedId = pointInfo._id
            let savedInfo;
            const editing = new Promise((request, response) => {
              map.removeLayer(layer)
              fetch("/load", {
                method: "GET"
              })
                .then(function (response) {
                  return response.json()
                })
                .then(function (json) {
                  data = json
                  dataAll = JSON.parse(JSON.stringify(data))
                  return data
                })
                .then(function (data) {
                  setFilterBaselines()
                  setFeatures()
                  setPopup()
                  addLayer()
                  setYearFilter()
                  setGroupFilter()
                  setStoreFilter()
                  return 0
                  })
                .then(function() {
                  for (let i = 0; i < newfeatures.length; i++){
                    if (newfeatures[i].A._id === savedId)
                      savedInfo = newfeatures[i].A
                  }
                  popupIndex = savedInfo.info.length-1
                  setContent(savedInfo)
                  return 0
                  })
            })
            return 0
          })
      }
    }
    content.appendChild(submitButton)
  }
  content.appendChild(plusButton)

  const displayedInfo = document.createElement("div")
  displayedInfo.innerHTML = '<h1>' + currInfo.address + '</h1>'
    + '<img src="' + currInfo.image_url + '" width="200px" height="200px">'
  if (currInfo.store_name !== ""){
    displayedInfo.innerHTML = displayedInfo.innerHTML + '<h4>Name: ' + currInfo.store_name + '</h4>'
  }
  displayedInfo.innerHTML = displayedInfo.innerHTML
    + '<h4>Year Collected: ' + currInfo.year_collected + '</h4>'
    + '<h4>Store Type: ' + currInfo.store_type + '</h4>'
    + '<h4>Group Type: ' + currInfo.group_type + '</h4>'
    + '<h4>NACE Code: ' + currInfo.nace_code + '</h4>'
    
  content.appendChild(displayedInfo)

  const pastButton = document.createElement("button");
  pastButton.innerText = "Previous Year";
  pastButton.classList.add('scrollButton');
  pastButton.onclick = function() {
    if (popupIndex > 0){
      popupIndex = popupIndex - 1
    }
    setContent(pointInfo)
  }
  content.appendChild(pastButton)

  const futureButton = document.createElement("button");
  futureButton.innerText = "Next Year";
  futureButton.classList.add('scrollButton');
  futureButton.onclick = function() {
    if (popupIndex < information.length-1){
      popupIndex = popupIndex + 1
    }
    setContent(pointInfo)
  }
  content.appendChild(futureButton)
}

function setYearFilter() {
  const yearFilter = document.querySelector('#yearFilter')
  const boxes = []

  let years = []
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].info.length; j++){
      if (!years.includes(data[i].info[j].year_collected)) {
        years.push(data[i].info[j].year_collected)
      }
    }
  }

  years = years.sort().filter(year => year !== "")

  for (let i = 0; i < years.length; i++) {
    yearFilter.innerHTML = yearFilter.innerHTML + '<br><input type="checkbox" id="' + years[i] + 'box">'
      + '<label for="' + years[i] + 'box">' + years[i] + '</label>'
  }

  for (let i = 0; i < years.length; i++) {
    let box = document.getElementById(years[i] + 'box')
    box.addEventListener("change", filterFeatures)
    boxes.push(box)
  }
}

function setGroupFilter() {
  const groupFilter = document.querySelector('#groupFilter')
  const boxes = []

  let groups = []
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].info.length; j++){
      if (!groups.includes(data[i].info[j].group_type)) {
        groups.push(data[i].info[j].group_type)
      }
    }
  }

  groups = groups.sort().filter(group => group !== "")

  for (let i = 0; i < groups.length; i++) {
    groupFilter.innerHTML = groupFilter.innerHTML + '<br><input type="checkbox" id="' + groups[i] + 'box">'
      + '<label for="' + groups[i] + 'box">' + groups[i] + '</label>'
  }

  for (let i = 0; i < groups.length; i++) {
    let box = document.getElementById(groups[i] + 'box')
    box.addEventListener("change", filterFeatures)
    boxes.push(box)
  }
}

function setStoreFilter() {
  const storeFilter = document.querySelector('#storeFilter')
  const boxes = []

  let stores = []
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].info.length; j++){
      if (!stores.includes(data[i].info[j].store_type)) {
        stores.push(data[i].info[j].store_type)
      }
    }
  }

  stores = stores.sort().filter(store => store !== "")

  for (let i = 0; i < stores.length; i++) {
    storeFilter.innerHTML = storeFilter.innerHTML + '<br><input type="checkbox" id="' + stores[i] + 'box">'
      + '<label for="' + stores[i] + 'box">' + stores[i] + '</label>'
  }

  for (let i = 0; i < stores.length; i++) {
    let box = document.getElementById(stores[i] + 'box')
    box.addEventListener("change", filterFeatures)
    boxes.push(box)
  }
}

function filterFeatures(e) {
  closer.blur();

  e.preventDefault()

  target = e.target.id.slice(0, -3)

  if(allYears.includes(target)){
    if (e.target.checked) {
      yearTargets.push(target)
    }
    else {
      yearTargets.splice(yearTargets.indexOf(target), 1)
    }
  }
  else if (allGroups.includes(target)){
    if (e.target.checked) {
      groupTargets.push(target)
    }
    else {
      groupTargets.splice(groupTargets.indexOf(target), 1)
    }
  }
  else if (allStores.includes(target)){
    if (e.target.checked) {
      storeTargets.push(target)
    }
    else {
      storeTargets.splice(storeTargets.indexOf(target), 1)
    }
  }

  data = JSON.parse(JSON.stringify(dataAll))

  if (yearTargets.length !== 0) {
    for (let i = 0; i < data.length; i++){
      data[i].info = data[i].info.filter(item => yearTargets.includes(String(item.year_collected)))
    }
  }
  if (groupTargets.length !== 0) {
    for (let i = 0; i < data.length; i++){
      data[i].info = data[i].info.filter(item => groupTargets.includes(item.group_type))
    }
  }
  if (storeTargets.length !== 0) {
    for (let i = 0; i < data.length; i++){
      data[i].info = data[i].info.filter(item => storeTargets.includes(item.store_type))
    }
  }

  map.removeLayer(layer)

  setFeatures()
  addLayer()
}

window.onload = function () {
  setMap()
  init = new Promise((request, response) => {
    map.removeLayer(layer)
    fetch("/load", {
      method: "GET"
    })
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        data = json
        dataAll = JSON.parse(JSON.stringify(data))
        return data
      })
      .then(function (data) {
        setFilterBaselines()
        setFeatures()
        setPopup()
        addLayer()
        setYearFilter()
        setGroupFilter()
        setStoreFilter()
        return 0
        })
  })
}