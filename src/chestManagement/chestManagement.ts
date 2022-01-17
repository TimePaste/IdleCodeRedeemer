/// <reference path="./../shared/globals.ts" />
/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../shared/idle_champions_api.ts" />

document.addEventListener("DOMContentLoaded", loaded)

const REQUEST_DELAY = 4000

let buyCountRange: HTMLInputElement, buyCountNumber: HTMLInputElement
let openCountRange: HTMLInputElement, openCountNumber: HTMLInputElement
let blacksmithCountRange: HTMLInputElement, blacksmithCountNumber: HTMLInputElement

let server: string | undefined
let instanceId: string | undefined
let userData: PlayerData | undefined
let shownCloseClientWarning = false

let blacksmithAggregate: BlacksmithAggregateResult

function loaded(){
    document.getElementById("refreshInventory")!.addEventListener('click', refreshClick)
    document.getElementById("purchaseButton")!.addEventListener('click', purchaseClick)
    document.getElementById("openButton")!.addEventListener('click', openClick)
    document.getElementById("blacksmithButton")!.addEventListener('click', blacksmithClick)

    document.getElementById("buyChestType")?.addEventListener('change', setMaximumValues)
    document.getElementById("openChestType")?.addEventListener('change', setMaximumValues)
    document.getElementById("blackithContracType")?.addEventListener('change', setMaximumValues)

    document.getElementById("heroId")?.addEventListener('change', updateSelectedHero)

    buyCountRange = document.getElementById("buyCountRange") as HTMLInputElement
    buyCountNumber = document.getElementById("buyCountNumber") as HTMLInputElement
    buyCountRange.oninput = buyRangeChanged
    buyCountNumber.oninput = buyNumberChanged

    openCountRange = document.getElementById("openCountRange") as HTMLInputElement
    openCountNumber = document.getElementById("openCountNumber") as HTMLInputElement
    openCountRange.oninput = openRangeChanged
    openCountNumber.oninput = openNumberChanged

    blacksmithCountRange = document.getElementById("blacksmithCountRange") as HTMLInputElement
    blacksmithCountNumber = document.getElementById("blacksmithCountNumber") as HTMLInputElement
    blacksmithCountRange.oninput = blacksmithRangeChanged
    blacksmithCountNumber.oninput = blacksmithNumberChanged

    const blackithContracType  = document.getElementById("blackithContracType") as HTMLSelectElement
}

function buyRangeChanged(){
    buyCountNumber.value = buyCountRange.value
}

function buyNumberChanged(){
    if(parseInt(buyCountNumber.value) > parseInt(buyCountNumber.max)){
      buyCountNumber.value = buyCountNumber.max
    }
    buyCountRange.value = buyCountNumber.value
}

function openRangeChanged(){
    openCountNumber.value = openCountRange.value
}

function openNumberChanged(){
    if(parseInt(openCountNumber.value) > parseInt(openCountNumber.max)){
        openCountNumber.value = openCountNumber.max
    }
    openCountRange.value = openCountNumber.value
}

function blacksmithRangeChanged(){
    blacksmithCountNumber.value = blacksmithCountRange.value
}

function blacksmithNumberChanged(){
    if(parseInt(blacksmithCountNumber.value) > parseInt(blacksmithCountNumber.max)){
        blacksmithCountNumber.value = blacksmithCountNumber.max
    }
    blacksmithCountRange.value = blacksmithCountNumber.value
}

function refreshClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            refreshInventory(userId, userHash)
        }
    )
}

async function refreshInventory(userId: string, hash: string) {
    if(!userId || userId.length == 0 || !hash || hash.length == 0){
        console.error("No credentials entered.")
        showError("No credentials entered.")
        return
    }
    
    if(!server){
        server = await IdleChampionsApi.getServer()
        console.log(`Got server ${server}`)
    }

    if(!server) {
        showError("Failed to get idle champions server.")
        console.error("Failed to get idle champions server.")
        return
    }

    userData = await IdleChampionsApi.getUserDetails({
        server: server,
        user_id: userId,
        hash: hash,
    })

    if(!userData) {
        showError("Failed to retreive user data.")
        console.error("Failed to retreive user data.")
        return
    }

    console.log("Refreshed inventory data.")
    console.debug(userData)

    instanceId = userData.details.instance_id
    chrome.storage.sync.set({[Globals.SETTING_INSTANCE_ID]: userData.details.instance_id})

    document.getElementById("gemCount")!.textContent = userData.details.red_rubies.toLocaleString()

    document.getElementById("silverChestCount")!.textContent = userData.details.chests[ChestType.Silver]?.toLocaleString() || "0"
    document.getElementById("goldChestCount")!.textContent = userData.details.chests[ChestType.Gold]?.toLocaleString() || "0"
    document.getElementById("electrumChestCount")!.textContent = userData.details.chests[ChestType.Electrum]?.toLocaleString() || "0"

    document.getElementById("whiteBlacksmithCount")!.textContent = findBuffCount(ContractType.Tiny.toString()).toLocaleString() || "0"
    document.getElementById("greenBlacksmithCount")!.textContent = findBuffCount(ContractType.Small.toString()).toLocaleString() || "0"
    document.getElementById("blueBlacksmithCount")!.textContent = findBuffCount(ContractType.Medium.toString()).toLocaleString() || "0"
    document.getElementById("purpleBlacksmithCount")!.textContent = findBuffCount(ContractType.Large.toString()).toLocaleString() || "0"

    setMaximumValues()
    updateSelectedHero()

    document.getElementById("actionTabs")!.classList.add("show")
}

function findBuffCount(buff_id: string) : number {
    var countString = userData?.details?.buffs?.find(b => b.buff_id == buff_id.toString())?.inventory_amount
    return parseInt(countString ?? "0")
}

function setMaximumValues(){
    if(!userData) return

    const gems = userData.details.red_rubies

    let buyMax = 0
    switch((document.getElementById("buyChestType") as HTMLSelectElement).value){
        case ChestType.Silver.toString():
            buyMax = Math.trunc(gems / 50)
            break
        case ChestType.Gold.toString():
            buyMax = Math.trunc(gems / 500)
            break
    }

    (document.getElementById("buyCountRange") as HTMLInputElement).max = buyMax.toString();
    (document.getElementById("buyCountRange") as HTMLInputElement).value = buyMax.toString();
    (document.getElementById("buyCountNumber") as HTMLInputElement).max = buyMax.toString();
    (document.getElementById("buyCountNumber") as HTMLInputElement).value = buyMax.toString();

    const chestType = (document.getElementById("openChestType") as HTMLSelectElement).value;
    const openMax = userData.details.chests[chestType] ?? 0;

    (document.getElementById("openCountRange") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountRange") as HTMLInputElement).value = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).value = openMax.toString();

    const contractType = (document.getElementById("blackithContracType") as HTMLSelectElement).value;
    const blacksmithMax = findBuffCount(contractType);

    (document.getElementById("blacksmithCountRange") as HTMLInputElement).max = blacksmithMax.toString();
    (document.getElementById("blacksmithCountRange") as HTMLInputElement).value = blacksmithMax.toString();
    (document.getElementById("blacksmithCountNumber") as HTMLInputElement).max = blacksmithMax.toString();
    (document.getElementById("blacksmithCountNumber") as HTMLInputElement).value = blacksmithMax.toString();
}

function updateSelectedHero(){
    const heroId = (document.getElementById("heroId") as HTMLSelectElement).value

    if(blacksmithAggregate?.heroId != heroId){
        blacksmithAggregate = new BlacksmithAggregateResult(heroId)
    }
    else{
        blacksmithAggregate.UpdateLevels()
    }

    displayBlacksmithResults(blacksmithAggregate)
}

function purchaseClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            purchaseChests(userId, userHash)
        }
    )
}

async function purchaseChests(userId: string, hash: string){
    if(!server) return

    const MAX_PURCHASE_AMOUNT = 100

    const chestType = <any>(document.getElementById("buyChestType") as HTMLSelectElement).value as ChestType
    const chestAmount = parseInt((document.getElementById("buyCountRange") as HTMLInputElement).value) || 0

    if(!chestType || chestAmount < 1){
        return
    }

    let remainingChests = chestAmount
    //Have to batch these into max of 100 at a time
    while(remainingChests > 0){
        showInfo(`Purchasing... ${remainingChests} chests remaining to purchase`)

        const currentAmount = remainingChests > MAX_PURCHASE_AMOUNT ? MAX_PURCHASE_AMOUNT : remainingChests
        remainingChests -= currentAmount

        console.log(`Purchasing ${currentAmount} chests`)

        const responseStatus = await IdleChampionsApi.purchaseChests({
            server: server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount
        })

        if(responseStatus == ResponseStatus.InsuficcientCurrency){
            console.error("Insufficient currency error")
            showError("Insufficient gems remaining")
            return
        }
        else if(responseStatus == ResponseStatus.Failed){
            console.error("Purchase API call failed")
            showError("Purchase failed")
            return
        }
        
        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed purchase")

    refreshInventory(userId, hash)

    showSuccess(`Purchased ${chestAmount} chests`)
}

function openClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            openChests(userId, userHash)
        }
    )
}

function blacksmithClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            useBlacksmithContracts(userId, userHash)
        }
    )
}


async function openChests(userId: string, hash: string){
    const MAX_OPEN_AMOUNT = 99

    if(!server || !instanceId) return

    if(!shownCloseClientWarning){
        showOpenWarning("You MUST close the client before calling open chests. Click open again to confirm.")
        shownCloseClientWarning = true
        return
    }
    shownCloseClientWarning = false

    let lootResults = new LootAggregateResult()

    const chestType = <any>(document.getElementById("openChestType") as HTMLSelectElement).value as ChestType
    const chestAmount = parseInt((document.getElementById("openCountRange") as HTMLInputElement).value) || 0

    if(!chestType || chestAmount < 1){
        return
    }

    let remainingChests = chestAmount
    //Have to batch these into max of 100 at a time
    while(remainingChests > 0){
        showInfo(`Opening... ${remainingChests} chests remaining to open`)
        
        const currentAmount = remainingChests > MAX_OPEN_AMOUNT ? MAX_OPEN_AMOUNT : remainingChests
        remainingChests -= currentAmount

        console.log(`Opening ${currentAmount} chests`)

        const openResponse = await IdleChampionsApi.openChests({
            server: server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount,
            instanceId: instanceId,
        })

        if(openResponse.status == ResponseStatus.OutdatedInstanceId){
            const lastInstanceId:string = instanceId
            console.log("Refreshing inventory for instance ID")
            refreshInventory(userId, hash)
            if(instanceId == lastInstanceId){
                console.error("Failed to refresh instance id")
                showError("Failed to get updated instance ID. Check credentials.")
                return
            }

            remainingChests += currentAmount
        }
        else if(openResponse.status == ResponseStatus.Failed){
            console.error("Purchase API call failed")
            showError("Purchase failed")
            return
        }
        
        aggregateOpenResults(openResponse.lootDetail ?? [], lootResults)

        displayLootResults(lootResults)

        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed opening")

    refreshInventory(userId, hash)

    showSuccess(`Opened ${chestAmount} chests`)
}

function hideMessages() {
    document.getElementById("error")!.classList.remove("show")
    document.getElementById("openWarning")!.classList.remove("show")
    document.getElementById("success")!.classList.remove("show")
    document.getElementById("info")!.classList.remove("show")
}

function showError(text:string){
    hideMessages()

    document.getElementById("error")!.classList.add("show")
    document.querySelector("#error span")!.innerHTML = text
}

function showOpenWarning(text:string){
    hideMessages()

    document.getElementById("openWarning")!.classList.add("show")
    document.querySelector("#openWarning span")!.innerHTML = text
}

function showInfo(text:string){
    hideMessages()

    document.getElementById("info")!.classList.add("show")
    document.querySelector("#info span")!.innerHTML = text
}

function showSuccess(text:string){
    hideMessages()

    document.getElementById("success")!.classList.add("show")
    document.querySelector("#success span")!.innerHTML = text
}

class LootAggregateResult{
    gems = 0;
    shinies = 0;
    commonBounties = 0;
    uncommonBounties = 0;
    rareBounties = 0;
    epicBounties = 0;
    commonBlacksmith = 0;
    uncommonBlacksmith = 0;
    rareBlacksmith = 0;
    epicBlacksmith = 0;
}

function aggregateOpenResults(loot:LootDetailsEntity[], aggregateResult:LootAggregateResult){
    aggregateResult.shinies += loot.filter(l => l.gilded).length;

    aggregateResult.commonBounties += loot.filter(l => l.add_inventory_buff_id == 17).length;
    aggregateResult.uncommonBounties += loot.filter(l => l.add_inventory_buff_id == 18).length;
    aggregateResult.rareBounties += loot.filter(l => l.add_inventory_buff_id == 19).length;
    aggregateResult.epicBounties += loot.filter(l => l.add_inventory_buff_id == 20).length;

    aggregateResult.commonBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Tiny).length;
    aggregateResult.uncommonBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Small).length;
    aggregateResult.rareBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Medium).length;
    aggregateResult.epicBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Large).length;

    aggregateResult.gems += loot.reduce((count, l) => count + (l.add_soft_currency ?? 0), 0)
}

function displayLootResults(aggregateResult:LootAggregateResult){
    document.querySelector("#chestLoot tbody")!.innerHTML = ""

    addTableRow("Shinies", aggregateResult.shinies)
    addTableRow("Gems", aggregateResult.gems)

    addTableRow("Tiny Bounty Contract", aggregateResult.commonBounties, "rarity-common")
    addTableRow("Small Bounty Contract", aggregateResult.uncommonBounties, "rarity-uncommon")
    addTableRow("Medium Bounty Contract", aggregateResult.rareBounties, "rarity-rare")
    addTableRow("Large Bounty Contract", aggregateResult.epicBounties, "rarity-epic")

    addTableRow("Tiny Blacksmithing Contract", aggregateResult.commonBlacksmith, "rarity-common")
    addTableRow("Small Blacksmithing Contract", aggregateResult.uncommonBlacksmith, "rarity-uncommon")
    addTableRow("Medium Blacksmithing Contract", aggregateResult.rareBlacksmith, "rarity-rare")
    addTableRow("Large Blacksmithing Contract", aggregateResult.epicBlacksmith, "rarity-epic")
}

function addTableRow(text:string, amount:number, style?:string){
    if(amount == 0) return

    let tbody = document.querySelector("#chestLoot tbody") as HTMLTableSectionElement

    tbody.append(buildTableRow(text, amount, style))
}

function buildTableRow(label: string, amount: number, style?:string) : HTMLTableRowElement{
    const labelColumn = document.createElement("td")
    labelColumn.innerText = label

    const amountColumn = document.createElement("td")
    amountColumn.innerText = amount.toString()

    const row = document.createElement("tr")
    if(style){
        row.classList.add(style)
    }
    row.appendChild(labelColumn)
    row.appendChild(amountColumn)

    return row
}

class BlacksmithAggregateResult{
    heroId: string;
    slotResult = new Array(7);
    slotEndValue = new Array(7);

    constructor(heroId: string){
        this.heroId = heroId
        this.UpdateLevels()
    }

    public UpdateLevels(){
        userData?.details?.loot?.filter(l => l.hero_id == parseInt(this.heroId)).forEach(lootItem => {
            this.slotEndValue[lootItem.slot_id] = lootItem.enchant + 1
        })
    }
}

async function useBlacksmithContracts(userId: string, hash: string){
    const MAX_BLACKSMITH_AMOUNT = 50

    if(!server || !instanceId) return

    const contractType = <any>(document.getElementById("blackithContracType") as HTMLSelectElement).value as ContractType
    const heroId = (document.getElementById("heroId") as HTMLSelectElement).value
    const blacksmithAmount = parseInt(blacksmithCountRange.value) || 0

    if(blacksmithAggregate?.heroId != heroId){
        blacksmithAggregate = new BlacksmithAggregateResult(heroId)
    }

    if(!contractType || !heroId || blacksmithAmount < 1){
        return
    }

    let remainingContracts = blacksmithAmount
    //Have to batch these into max of 100 at a time
    while(remainingContracts > 0){
        showInfo(`Smithing... ${remainingContracts} contracts remaining to use`)
        
        const currentAmount = Math.min(remainingContracts, MAX_BLACKSMITH_AMOUNT)
        remainingContracts -= currentAmount

        console.log(`Using ${currentAmount} contracts`)

        const blacksmithResponse = await IdleChampionsApi.useBlacksmith({
            server: server,
            user_id: userId,
            hash: hash,
            heroId: heroId,
            contractType: contractType,
            count: currentAmount,
            instanceId: instanceId,
        })

        if(blacksmithResponse.status == ResponseStatus.OutdatedInstanceId){
            const lastInstanceId:string = instanceId
            console.log("Refreshing inventory for instance ID")
            refreshInventory(userId, hash)
            if(instanceId == lastInstanceId){
                console.error("Failed to refresh instance id")
                showError("Failed to get updated instance ID. Check credentials.")
                return
            }

            remainingContracts += currentAmount
        }
        else if(blacksmithResponse.status == ResponseStatus.Failed){
            console.error("Blacksmith API call failed")
            showError("Blacksmithing failed")
            return
        }
        
        aggregateBlacksmithResults(blacksmithResponse.actions ?? [], blacksmithAggregate)

        displayBlacksmithResults(blacksmithAggregate)

        if(remainingContracts > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed blacksmithing")

    refreshInventory(userId, hash)

    showSuccess(`Used ${blacksmithAmount} blacksmith contracts`)
}

function aggregateBlacksmithResults(blacksmithActions:BlacksmithAction[], aggregateResult:BlacksmithAggregateResult){
    blacksmithActions.forEach(action => {
        if(action.action == "level_up_loot"){
            var newLevels = parseInt(action.amount)
            aggregateResult.slotResult[action.slot_id] = (aggregateResult.slotResult[action.slot_id] ?? 0) + newLevels
            aggregateResult.slotEndValue[action.slot_id] = action.enchant_level + 1
        }
    })
}

function displayBlacksmithResults(aggregateResult:BlacksmithAggregateResult){
    document.querySelector("#blacksmithResults tbody")!.innerHTML = ""

    addBlacksmithTableRow("Slot 1", aggregateResult.slotResult[1], aggregateResult.slotEndValue[1])
    addBlacksmithTableRow("Slot 2", aggregateResult.slotResult[2], aggregateResult.slotEndValue[2])
    addBlacksmithTableRow("Slot 3", aggregateResult.slotResult[3], aggregateResult.slotEndValue[6])
    addBlacksmithTableRow("Slot 4", aggregateResult.slotResult[4], aggregateResult.slotEndValue[4])
    addBlacksmithTableRow("Slot 5", aggregateResult.slotResult[5], aggregateResult.slotEndValue[5])
    addBlacksmithTableRow("Slot 6", aggregateResult.slotResult[6], aggregateResult.slotEndValue[6])
}

function addBlacksmithTableRow(text:string, amount:number, newLevel: number, style?:string){
    let tbody = document.querySelector("#blacksmithResults tbody") as HTMLTableSectionElement

    tbody.append(buildBlacksmithTableRow(text, amount, newLevel, style))
}

function buildBlacksmithTableRow(slotName: string, addedLevels: number, newLevel: number, style?:string) : HTMLTableRowElement{
    const slotColumn = document.createElement("td")
    slotColumn.innerText = slotName

    const addedLevelsColumn = document.createElement("td")
    addedLevelsColumn.innerText = addedLevels?.toString() || "0"

    const newLevelColumn = document.createElement("td")
    newLevelColumn.innerText = newLevel?.toString() || "0"

    const row = document.createElement("tr")
    if(style){
        row.classList.add(style)
    }
    row.appendChild(slotColumn)
    row.appendChild(addedLevelsColumn)
    row.appendChild(newLevelColumn)

    return row
}