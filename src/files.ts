import { NewThing } from "./TierSchema"

export const newThingFromFile = (f: File): Promise<NewThing> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve({
          title: f.name,
          type: "image",
          dataUrl: reader.result as string
        })
      }
      reader.readAsDataURL(f)
    } catch (e) {
      reject(e)
    }
  })
}

export const newThingsFromDataTransferItemList = async (itemList: DataTransferItemList): Promise<NewThing[]> => {
  const promises = [...itemList].filter((item) => item.type === 'text/uri-list').map(async (item) => {
    const p = new Promise<NewThing>((resolve) => {
      item.getAsString(async (url: string) => {
        const response = await fetch(url)
        const blob = await response.blob()
        const f = new File([blob], 'image.jpg')
        const t = await newThingFromFile(f)
        resolve(t)
      })
    })
    return p
  })
  return Promise.all(promises)
}