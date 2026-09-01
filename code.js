const NOTE_FLOW_KEY = '921fe58d13923e763a95d260ca04338e344b5ff0'
const NOTE_SUBFLOW_KEY = '3b019526775e5005f2041f034312f3f63afda528'
const HEADER_KEY = 'f9eaa0ac7559d649db6b51862081988ba076a9aa'
const COVER_KEYS = {
    'Foundation': 'c6d4d36a91e3bfc683b9c851ee4be8fb38a23abf',
    'Trade': '8c0b258e92f577777ea57801499b0214356b5904',
    'Growth': '29f758beead125ebfef0762267e235be8bd58390',
}

function paint(r, g, b, a) {
    var p = { type: 'SOLID', color: { r: r, g: g, b: b } }
    if (a !== undefined) p.opacity = a
    return p
}

async function createNoteInstance(key, label, width) {
    var comp = await figma.importComponentByKeyAsync(key)
    var inst = comp.createInstance()
    inst.name = label
    inst.resizeWithoutConstraints(width, inst.height)
    return inst
}

async function createCoverInstance(brand) {
    var key = COVER_KEYS[brand]
    var comp = await figma.importComponentByKeyAsync(key)
    var inst = comp.createInstance()
    inst.name = 'Cover'
    return inst
}

async function createTaskPage() {
    var sectionFill = paint(0.96, 0.96, 0.96)
    var sectionStroke = paint(0, 0, 0, 0.1)

    var taskPage = figma.createPage()
    taskPage.name = '\u270F\uFE0F Task name here'

    var explorationSection = figma.createSection()
    explorationSection.name = '#0000 - Task name here'
    explorationSection.resizeWithoutConstraints(5000, 5000)
    explorationSection.fills = [sectionFill]
    explorationSection.strokes = [sectionStroke]
    taskPage.appendChild(explorationSection)
    explorationSection.x = -7230
    explorationSection.y = -2800

    var relatedNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Related', 339)
    explorationSection.appendChild(relatedNote)
    relatedNote.x = 300
    relatedNote.y = 300

    var flowNote = await createNoteInstance(NOTE_FLOW_KEY, 'Flow/Journey', 935)
    explorationSection.appendChild(flowNote)
    flowNote.x = 300
    flowNote.y = 398

    var subflowNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Subflow', 935)
    explorationSection.appendChild(subflowNote)
    subflowNote.x = 300
    subflowNote.y = 496

    return { page: taskPage, section: explorationSection }
}

async function createHandoffPage() {
    var sectionFill = paint(0.8, 0.8, 0.8)
    var sectionStroke = paint(0, 0, 0, 0.1)

    var handoffPage = figma.createPage()
    handoffPage.name = '\u2705 Task name here'

    var section = figma.createSection()
    section.name = '#0000 - Task name here'
    section.resizeWithoutConstraints(5000, 5000)
    section.fills = [sectionFill]
    section.strokes = [sectionStroke]
    handoffPage.appendChild(section)
    section.x = -7230
    section.y = -2800

    var headerComponent = await figma.importComponentByKeyAsync(HEADER_KEY)
    var headerInstance = headerComponent.createInstance()
    headerInstance.name = 'Header'
    section.appendChild(headerInstance)
    headerInstance.x = 300
    headerInstance.y = 300

    var flowNote = await createNoteInstance(NOTE_FLOW_KEY, 'Flow/Journey', 935)
    section.appendChild(flowNote)
    flowNote.x = 300
    flowNote.y = 618

    var subflowNote = await createNoteInstance(NOTE_SUBFLOW_KEY, 'Subflow', 935)
    section.appendChild(subflowNote)
    subflowNote.x = 300
    subflowNote.y = 716

    return { page: handoffPage, section: section }
}

function pushActionStates(actions) {
    for (var i = 0; i < actions.length; i++) {
        parent.postMessage({ pluginMessage: { type: 'action-state', id: actions[i].id, disabled: actions[i].disabled } }, '*')
    }
}

async function runSetup() {
    var doc = figma.root
    var existingPages = doc.children.slice()
    var newPageIds = {}

    var result = await createTaskPage()
    var taskPage = result.page
    var taskSection = result.section
    newPageIds[taskPage.id] = true

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

    figma.viewport.scrollAndZoomIntoView([taskSection])
    figma.notify('Exploration file organized!')
}

async function runSetupHandoff() {
    var doc = figma.root
    var existingPages = doc.children.slice()
    var newPageIds = {}

    var result = await createHandoffPage()
    var handoffPage = result.page
    var handoffSection = result.section
    newPageIds[handoffPage.id] = true

    figma.createPageDivider('---')
    newPageIds[doc.children[doc.children.length - 1].id] = true

    var coverPage = figma.createPage()
    coverPage.name = '\uD83D\uDCC4 Cover'
    newPageIds[coverPage.id] = true

    var coverInstance = await createCoverInstance('Foundation')
    coverPage.appendChild(coverInstance)
    coverInstance.x = 2097
    coverInstance.y = -435

    await figma.setCurrentPageAsync(handoffPage)

    for (var i = 0; i < existingPages.length; i++) {
        var page = existingPages[i]
        if (!newPageIds[page.id] && page.children.length === 0) {
            page.remove()
        }
    }

    figma.viewport.scrollAndZoomIntoView([handoffSection])
    figma.notify('Handoff file organized!')
}

async function runAddPage() {
    var result = await createTaskPage()
    await figma.setCurrentPageAsync(result.page)
    figma.viewport.scrollAndZoomIntoView([result.section])
    figma.notify('Exploration page added!')
}

async function runAddHandoff() {
    var result = await createHandoffPage()
    await figma.setCurrentPageAsync(result.page)
    figma.viewport.scrollAndZoomIntoView([result.section])
    figma.notify('Handoff page added!')
}

figma.showUI(__html__, { width: 300, height: 200 })

figma.ui.onmessage = async function (msg) {
    if (msg.type === 'resize') {
        figma.ui.resize(300, Math.max(120, Math.min(900, Math.round(msg.height))))
        return
    }
    if (msg.type === 'run-action') {
        if (msg.id === 'setup') await runSetup()
        else if (msg.id === 'addpage') await runAddPage()
        else if (msg.id === 'addhandoff') await runAddHandoff()
        else if (msg.id === 'setuphandoff') await runSetupHandoff()
    }
}
