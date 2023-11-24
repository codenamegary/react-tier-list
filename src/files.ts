import { NewThing } from "./TierSchema"

const newThingFromFile = (f: File): Promise<NewThing> => {
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

export const newThingsFromFileList = async (files: FileList): Promise<NewThing[]> => {
  const indexes = [...Array(files.length).keys()]
  const promises = indexes.map(async (idx) => newThingFromFile(files[idx]))
  return await Promise.all(promises)
}
