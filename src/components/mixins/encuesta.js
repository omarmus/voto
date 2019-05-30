export default {
  methods: {
    convertEncuesta (id, data) {
      let respuestas = []
      Object.keys(data.respuestas).map((key, index) => {
        let item = data.respuestas[key]
        item.id = key
        item.color = `color-${index + 1}`
        respuestas.push(item)
      })
      return {
        id,
        number: data.number,
        pregunta: data.pregunta,
        active: data.active,
        respuestas
      }
    }
  }
}
