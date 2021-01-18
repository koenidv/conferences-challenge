
// Currently using Chrome Synced Storage, not a relational database. 
// (Better implementation with extensions, synced accross devices)
// This might not be the best solution, but handling everything
// "database"-related in this file means it could easily be
// switched up later

/**
 * Get all conferences from storage
 * empty array if none are saved
 */
function get(callback) {
    chrome.storage.sync.get("conferences", (items) => {
        if (items.conferences == undefined) {
            callback([])
        } else {
            callback(items.conferences)
        }
    })
 }
 
/** 
 * Get a conference by its id
 * undefined if no matching conference was found
 */
 function getById(id, callback) {
    // Get all conferences and call back with the one with a matching id
    get( (conferences) => {
        callback(conferences.find( (element) => element.id == id ))
    })
 }

/**
 * Save a conference object to synced storage
 */
function save(conference, callback) {
    // First, get current items
    get( (conferences) => {
        // conferences: Conference[]

        // Update/create
        // If there's already a conference with the same id, update it
        let itemIndex = conferences.findIndex( (element) => element.id == conference.id )
        if (itemIndex != -1) {
            conferences[itemIndex] = conference
        } else {
            // Else add this conference to the list
            conferences.push(conference)
        }

        // .. and save all to synced storage
        chrome.storage.sync.set(
            { "conferences": conferences },
            callback
        )
        // Other key/value combinations in storage
        // will not be affected by this
    })
}

/**
 * Remove a conference from storage by its id
 */
function remove(id) {
    // Get currently saved conferences
    get( (conferences) => {
        // Get the item's index within the array
        let index = conferences.find(element => element.id == id)
        // If the items was found, remove it from the array and save to storage
        if (index != -1) {
            conferences.splice(index, 1)
            chrome.storage.sync.set({"conferences": conferences}, () => { })
        }
    })
}

/**
 * Get the highest "auto increment" id in the database
 * and return it increased by 1
 * Storage is not synchronous, therefore we need to implement a callback
 */
function getNextIndex(callback) {
    // Get currently saved conferences
    get( (conferences) => {
        // If no conferences were added yet, return 0
        if (conferences === undefined) {
            callback(0)
        } else {
            // Get the maximum of...
            var maxIndex = Math.max.apply(
                Math,
                // ...each conference's id
                conferences.map(
                    function (conference) {
                        return conference.id
                    }
                ))

            // If invalid ids were saved, return 0
            if (isNaN(maxIndex) || maxIndex < 0) callback(0)
            // else return the max index plus 1
            else callback(maxIndex + 1)
        }
    })
}
