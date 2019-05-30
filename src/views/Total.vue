<template>
  <div class="container">
    <div class="total">
      <div class="alert alert-danger text-center" v-if="error">
        {{ error }}
      </div>
      <div class="alert alert-success text-center" v-if="success">
        {{ success }}
      </div>
      <div class="alert alert-warning text-center" v-if="warning">
        {{ warning }}
      </div>
      <template v-if="!warning">
        <div class="header grid grid-header">
          <div class="qr-container" v-if="encuesta.active">
            <qrcode-vue :value="url" v-if="url"></qrcode-vue>
            <button
              class="btn btn-error"
              @click="cerrar">Cerrar encuesta</button>
          </div>
          <div class="total-pregunta">
            <template v-if="Object.keys(encuesta).length">
              <h2 class="text-center total-title">
                {{ encuesta.number }}. {{ encuesta.pregunta }}
              </h2>
              <h3 class="total-count">Total votos: <span>{{ total }}</span></h3>
            </template>
            <div class="canvas-container">
              <canvas id="myChart" width="400" height="400"></canvas>
            </div>
          </div>
        </div>

        <ul class="total-respuestas">
          <li
            v-for="(item, index) in totales"
            :key="item.id"
            :class="{ 'max': index === 0 }">
            <span class="total-color" :class="item.color"></span>
            <div class="total-respuesta">
              <strong class="total-opcion">{{ item.number }}.</strong> {{ item.texto }}
              <span class="total-number"><strong>{{ item.total }}</strong> <span>votos</span></span>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js'
import QrcodeVue from 'qrcode.vue'
import firebase from 'firebase'
import encuesta from '../components/mixins/encuesta'

const colors = {
  'color-10': '#5867dd',
  'color-8': '#36a3f7',
  'color-7': '#ffb822',
  'color-6': '#f4516c',
  'color-9': '#34bfa3',
  'color-1': '#adb4ee',
  'color-2': '#98d0fb',
  'color-3': '#ffd988',
  'color-4': '#fab1bd',
  'color-5': '#7ddcc9'
}

const url = 'https://omarmus.github.io/voto/#/'

export default {
  mixins: [ encuesta ],
  components: {
    QrcodeVue
  },
  data () {
    return {
      encuesta: {},
      url: null,
      key: null,
      warning: null,
      error: null,
      success: null
    }
  },
  computed: {
    total () {
      let count = 0
      if (this.encuesta.respuestas && Array.isArray(this.encuesta.respuestas)) {
        this.encuesta.respuestas.map(item => {
          count += parseInt(item.total)
        })
      }
      return count
    },
    totales () {
      if (this.encuesta.respuestas && Array.isArray(this.encuesta.respuestas)) {
        let items = Object.assign(this.encuesta.respuestas)
        items.sort((a, b) => {
          return b.total - a.total
        })
        return items
      }

      return []
    }
  },
  mounted () {
    this.key = this.$route.params.key
    this.render()
  },
  methods: {
    render () {
      firebase.database().ref('preguntas/' + this.key)
        .on('value', (snapshot) => {
          let data = snapshot.val()
          if (data) {
            this.url += url + `pregunta/${this.key}`
            if (!data.active) {
              this.success = '¡Encuesta cerrada! 😃'
            }
            this.encuesta = this.convertEncuesta(this.key, data)
            this.renderPie()
          } else {
            this.warning = 'No existe la encuesta 🙁'
          }
        })
    },
    cerrar () {
      if (confirm('¿Realmente quiere cerrar la encuesta?')) {
        firebase.database().ref(`preguntas/${this.key}`)
          .update({
            active: false
          }, () => {
            this.render()
          })
      }
    },
    renderPie () {
      var ctx = document.getElementById('myChart')
      let labels = []
      let data = []
      let backgroundColor = []
      let borderColor = []
      this.encuesta.respuestas.map(item => {
        labels.push(`${item.number}`)
        data.push(item.total)
        backgroundColor.push(colors[item.color])
        borderColor.push(colors[item.color])
      })
      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Número de Votos',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1
          }]
        },
        options: {
          animation: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      })
      console.log(myChart)
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/_variables.scss';

.canvas-container {
  text-align: center;
  // padding: 20px 0;

  canvas {
    margin: 0 auto;
    max-width: 400px;
    width: 100% !important;
  }
}

.color-10 {
  background-color: $primary;
}
.color-8 {
  background-color: $info;
}
.color-7 {
  background-color: $warning;
}
.color-6 {
  background-color: $error;
}
.color-9 {
  background-color: $success;
}
.color-1 {
  background-color: lighten($primary, 20%);
}
.color-2 {
  background-color: lighten($info, 20%);
}
.color-3 {
  background-color: lighten($warning, 20%);
}
.color-4 {
  background-color: lighten($error, 20%);
}
.color-5 {
  background-color: lighten($success, 20%);
}

.total-count {
  text-align: center;
  font-weight: 600;

  span {
    color: $primary;
  }
}

.total-opcion {
  font-size: 1.1rem;
}

.total {
  padding-top: 50px;
}
.total-respuestas {
  list-style: none;
  margin: 20px 0 0 0;
  padding: 0;

  li {
    padding: 12px 10px;
    border-bottom: 1px solid #cccccc;
    position: relative;

    &:last-child {
      border: none;
    }

    .total-respuesta {
      padding-left: 40px;
      position: relative;
      padding-right: 100px;
    }

    .total-number {
      position: absolute;
      right: 0;
      top: 0;
      color: #121212;
      font-size: 1.1rem;
      width: 90px;
      text-align: right;

      span {
        color: $primary;
        font-size: .9rem;
        font-weight: 600;
        display: inline-block;
        margin-left: 5px;
      }
    }

    .total-color {
      position: absolute;
      top: 12px;
      left: 12px;
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }
  }
}
.grid {
  &.grid-header {
    grid-template-columns: 122px 1fr;
  }
}

.qr-container {
  text-align: center;

  & > div {
    text-align: center;
  }

  .btn {
    margin-top: 50px;
    white-space: initial;
    line-height: 1.2rem;
    padding: 15px 10px;
    font-size: .8rem;
  }

  canvas {
    width: 120px !important;
    height: 120px !important;
  }
}

.max {
  background-color: lighten($success, 40%);
}

@media (max-width: 768px) {
  .grid.grid-header {
    grid-template-columns: 1fr;
  }

  .qr-container {
    .btn {
      margin-bottom: 40px;
    }
  }
}
</style>
