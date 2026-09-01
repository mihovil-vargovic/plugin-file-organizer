const NOTE_FLOW_KEY = '921fe58d13923e763a95d260ca04338e344b5ff0'
const NOTE_SUBFLOW_KEY = '3b019526775e5005f2041f034312f3f63afda528'
const HEADER_KEY = 'f9eaa0ac7559d649db6b51862081988ba076a9aa'
const COVER_KEYS = {
  'Foundation': 'c6d4d36a91e3bfc683b9c851ee4be8fb38a23abf',
  'Trade': '8c0b258e92f577777ea57801499b0214356b5904',
  'Growth': '29f758beead125ebfef0762267e235be8bd58390',
}

function paint(r, g, b, opacity) {
  if (opacity === undefined) opacity = 1
  return { type: 'SOLID', color: { r: r, g: g, b: b }, opacity: opacity }
}

async function createNoteInstance(componentKey, label, width) {
  const component = await figma.importComponentByKeyAsync(componentKey)
  const instance = component.createInstance()
  instance.name = 'Note'
  instance.resize(width, instance.height)
  const textNode = instance.findOne(function (n) { return n.type === 'TEXT' && n.name === 'Text' })
  if (textNode) {
    await figma.loadFontAsync(textNode.fontName)
    textNode.characters = label
  }
  return instance
}

async function createCoverInstance(team) {
  const key = COVER_KEYS[team]
  const component = await figma.importComponentByKeyAsync(key)
  return component.createInstance()
}

async function createTaskPage() {
  const sectionFill = paint(0.8, 0.8, 0.8)
  const sectionStroke = paint(0, 0, 0, 0.1)
  const taskPage = figma.createPage()
  taskPage.name = '#0000 - [Task name]'
  const explorationSection = figma.createSection()
  explorationSection.name = '[Exploration] #0000 - [Task name]'
  explorationSection.resizeWithoutConstraints(5000, 5000)
  explorationSection.fills = [sectionFill]
  explorationSection.strokes = [sectionStroke]
  taskPage.appendChild(explorationSection)
  explorationSection.x = -2501
  explorationSection.y = -2400

  const relatedNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Related', 339)
  relatedNote.fills = [paint(1, 1, 1)]
  relatedNote.setProperties({ 'Description#268:0': true })
  const descNode = relatedNote.findOne(function (n) { return n.type === 'TEXT' && n.name === 'Description' })
  if (descNode) {
    await figma.loadFontAsync(descNode.fontName)
    descNode.characters = 'Handoff here Slack here'
  }
  explorationSection.appendChild(relatedNote)
  relatedNote.x = 300
  relatedNote.y = 300

  const flowNote = await createNoteInstance(NOTE_FLOW_KEY, 'Flow/Journey', 935)
  explorationSection.appendChild(flowNote)
  flowNote.x = 939
  flowNote.y = 300

  const subflowNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Subflow', 935)
  explorationSection.appendChild(subflowNote)
  subflowNote.x = 939
  subflowNote.y = 398

  return { page: taskPage, section: explorationSection }
}

async function createHandoffPage() {
  const sectionFill = paint(0.8, 0.8, 0.8)
  const sectionStroke = paint(0, 0, 0, 0.1)
  const handoffPage = figma.createPage()
  handoffPage.name = '\u2705 Task name here'
  const section = figma.createSection()
  section.name = '#0000 - Task name here'
  section.resizeWithoutConstraints(5000, 5000)
  section.fills = [sectionFill]
  section.strokes = [sectionStroke]
  handoffPage.appendChild(section)
  section.x = -2501
  section.y = -2400

  const headerComponent = await figma.importComponentByKeyAsync(HEADER_KEY)
  const headerInstance = headerComponent.createInstance()
  headerInstance.name = 'Header'
  section.appendChild(headerInstance)
  headerInstance.x = 300
  headerInstance.y = 300

  const flowNote = await createNoteInstance(NOTE_FLOW_KEY, 'Flow/Journey', 935)
  section.appendChild(flowNote)
  flowNote.x = 300
  flowNote.y = 618

  const subflowNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Subflow', 935)
  section.appendChild(subflowNote)
  subflowNote.x = 300
  subflowNote.y = 716

  return { page: handoffPage, section: section }
}

function pushActionStates() {
  var selection = figma.currentPage.selection
  var noSelection = selection.length === 0
  figma.ui.postMessage({
    type: 'action-state',
    actions: {
      setup: { enabled: noSelection, label: 'Set up exploration file', status: noSelection ? '' : 'Deselect all layers first' },
      addpage: { enabled: noSelection, label: 'Add exploration page', status: noSelection ? '' : 'Deselect all layers first' },
      addhandoff: { enabled: noSelection, label: 'Add handoff page', status: noSelection ? '' : 'Deselect all layers first' },
    },
  })
}

async function runSetup() {
  var doc = figma.root
  var existingPages = doc.children.slice()
  var newPageIds = {}

  var designHeader = figma.createPage()
  designHeader.name = 'DESIGN'
  newPageIds[designHeader.id] = true

  var result = await createTaskPage()
  var taskPage = result.page
  var explorationSection = result.section
  newPageIds[taskPage.id] = true

  figma.createPageDivider('---')
  newPageIds[doc.children[doc.children.length - 1].id] = true

  var feedbackHeader = figma.createPage()
  feedbackHeader.name = 'FEEDBACK'
  newPageIds[feedbackHeader.id] = true

  var qaPage = figma.createPage()
  qaPage.name = '\uD83D\uDEC2 Design QA'
  newPageIds[qaPage.id] = true

  var dqaSection = figma.createSection()
  dqaSection.name = '[DQA] #0000 - [Task name]'
  dqaSection.resizeWithoutConstraints(5000, 5000)
  dqaSection.fills = [paint(0.8, 0.8, 0.8)]
  dqaSection.strokes = [paint(0, 0, 0, 0.1)]
  qaPage.appendChild(dqaSection)
  dqaSection.x = -2500
  dqaSection.y = -2500

  var relatedNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Related', 339)
  relatedNote.fills = [paint(1, 1, 1)]
  relatedNote.setProperties({ 'Description#268:0': true })
  var descNode = relatedNote.findOne(function (n) { return n.type === 'TEXT' && n.name === 'Description' })
  if (descNode) {
    await figma.loadFontAsync(descNode.fontName)
    descNode.characters = 'Handoff here Slack here'
  }
  dqaSection.appendChild(relatedNote)
  relatedNote.x = 300
  relatedNote.y = 300

  var dqaFlowNote = await createNoteInstance(NOTE_FLOW_KEY, 'v1.0', 2000)
  dqaSection.appendChild(dqaFlowNote)
  dqaFlowNote.x = 939
  dqaFlowNote.y = 300

  var dqaSubflowNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Subflow', 2000)
  dqaSection.appendChild(dqaSubflowNote)
  dqaSubflowNote.x = 939
  dqaSubflowNote.y = 398

  figma.createPageDivider('---')
  newPageIds[doc.children[doc.children.length - 1].id] = true

  var coverPage = figma.createPage()
  coverPage.name = '\uD83D\uDCC4 Cover'
  newPageIds[coverPage.id] = true

  var coverInstance = await createCoverInstance('Foundation')
  coverPage.appendChild(coverInstance)
  coverInstance.x = 2097
  coverInstance.y = -435

  await figma.setCurrentPageAsync(taskPage)

  for (var i = 0; i < existingPages.length; i++) {
    var page = existingPages[i]
    if (!newPageIds[page.id] && page.children.length === 0) {
      page.remove()
    }
  }

  figma.viewport.scrollAndZoomIntoView([explorationSection])
  figma.notify('File organized!')
}

async function runAddPage() {
  var doc = figma.root
  var pages = doc.children.slice()
  var insertIndex = -1
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].name === 'DESIGN') {
      insertIndex = i + 1
      break
    }
  }
  var result = await createTaskPage()
  if (insertIndex >= 0) doc.insertChild(insertIndex, result.page)
  await figma.setCurrentPageAsync(result.page)
  figma.viewport.scrollAndZoomIntoView([result.section])
  figma.notify('Page added!')
}

async function runAddHandoff() {
  var doc = figma.root
  var result = await createHandoffPage()
  doc.insertChild(0, result.page)
  await figma.setCurrentPageAsync(result.page)
  figma.viewport.scrollAndZoomIntoView([result.section])
  figma.notify('Page added!')
}

figma.showUI(__html__, { width: 300, height: 230 })
pushActionStates()
figma.on('selectionchange', pushActionStates)

figma.ui.onmessage = function (msg) {
  if (msg.type === 'run-action') {
    if (msg.id === 'setup') runSetup()
    else if (msg.id === 'addpage') runAddPage()
    else if (msg.id === 'addhandoff') runAddHandoff()
  }
}
