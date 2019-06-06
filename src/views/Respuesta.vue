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
      <div class="header grid grid-header">
        <div class="qr-container qr-header" v-if="encuesta.active">
          <qrcode-vue :value="url" v-if="url" class="total-qr"></qrcode-vue>
          <div class="total-btns">
            <button
              v-if="edit"
              class="btn btn-error"
              @click="cerrar">Cerrar encuesta</button>
            <button
              v-if="!voto"
              class="btn"
              @click="irEncuesta">Ir a la encuesta</button>
          </div>
        </div>
        <div class="total-pregunta">
          <template v-if="Object.keys(encuesta).length">
            <h2 class="total-title">
              {{ encuesta.number }}. {{ encuesta.pregunta }}
            </h2>
            <h3 class="total-count">Total votos: <span>{{ total }}</span></h3>
          </template>
          <div class="canvas-container" v-show="total > 0">
            <canvas id="myChart" :width="size" :height="size"></canvas>
          </div>
        </div>
      </div>

      <ul class="total-respuestas">
        <li
          v-for="(item) in encuesta.respuestas"
          :key="item.id">
          <div class="total-item grid">
            <span class="total-color" :class="item.color"></span>
            <div class="total-respuesta">
              <strong class="total-opcion">{{ item.number }}.</strong> {{ item.texto }}
            </div>
            <div class="total-votos">
              <span class="total-number"><strong>{{ item.total }}</strong> <span>votos</span></span>
            </div>
          </div>
          <div
            class="total-progress"
            v-if="item.total"
            :style="{ 'width': (item.total * 100 / total + '%') }"></div>
        </li>
      </ul>
      <div class="qr-container qr-footer">
        <qrcode-vue :value="url" v-if="url" class="total-qr"></qrcode-vue>
        <div class="total-btns">
          <button
            v-if="edit"
            class="btn btn-error"
            @click="cerrar">Cerrar encuesta</button>
          <button
            v-if="!voto"
            class="btn"
            @click="irEncuesta">Ir a la encuesta</button>
        </div>
      </div>
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
      success: null,
      size: 200,
      edit: false,
      voto: false
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
    }
  },
  created () {
    this.edit = this.$route.name === 'respuesta'
  },
  mounted () {
    this.key = this.$route.params.key
    this.voto = !!localStorage.getItem(`app-voto#${this.key}`)
    this.render()
  },
  methods: {
    irEncuesta () {
      this.$router.push(`/pregunta/${this.key}`)
    },
    render () {
      this.url = url + `pregunta/${this.key}`
      firebase.database().ref('preguntas/' + this.key)
        .on('value', (snapshot) => {
          let data = snapshot.val()
          if (data) {
            if (data.active) {
              if (this.edit) {
                this.success = '¡Encuesta abierta! 😃'
              } else {
                if (this.voto) {
                  this.success = '¡Gracias por su voto! 😃'
                } else {
                  this.success = '¡Encuesta abierta! 😃'
                }
              }
              this.error = null
            } else {
              this.success = null
              this.error = '¡Encuesta cerrada! 😒'
            }
            this.encuesta = this.convertEncuesta(this.key, data)
            this.renderPie()
          } else {
            this.warning = 'No existe la encuesta 😅'
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
      console.log('DIBUJAR', ctx)
      let labels = []
      let data = []
      let backgroundColor = []
      this.encuesta.respuestas.map(item => {
        labels.push(`${item.number} = ${item.total}`)
        data.push(item.total)
        backgroundColor.push(colors[item.color])
      })
      var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Número de Votos',
            data,
            backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          legend: {
            position: 'top'
          },
          animation: false
        }
      })

      console.log(myChart)
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/_variables.scss';

.header {
  margin-top: 40px;
}

.total-item {
  position: relative;
  background: transparent;
  grid-template-columns: 30px 1fr 100px;
  z-index: 2;
  align-items: center;
}

.total-title {
  margin: 0 0 20px;
  text-align: center;
}

.total-progress {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: lighten($warning, 30%);
  z-index: 1;
  transition: width ease .5s;
  // border-top: 4px solid #ffffff;
  // border-bottom: 4px solid #ffffff;
}

.canvas-container {
  margin-top: 20px;
  text-align: center;

  canvas {
    margin: 0 auto;
    max-width: 200px;
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
  padding-top: 20px;
}
.total-respuestas {
  list-style: none;
  // margin: 20px 0 0 0;
  padding: 0;

  li {
    padding: 12px 10px;
    border-bottom: 1px solid #eeeeee;
    position: relative;

    &:last-child {
      border: none;
    }

    .total-number {
      color: #121212;
      font-size: 1.1rem;

      span {
        color: $primary;
        font-size: .9rem;
        font-weight: 600;
        display: inline-block;
        margin-left: 5px;
      }
    }

    .total-color {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }
  }
}
.grid {
  &.grid-header {
    grid-template-columns: 150px 1fr;
  }
}

.qr-container {
  text-align: center;
  margin-left: 20px;

  .total-qr {
    text-align: center;
    margin-bottom: 50px;
  }

  .btn {
    white-space: initial;
    line-height: 1rem;
    font-size: .8rem;
    margin-bottom: 8px;
  }

  canvas {
    width: 120px !important;
    height: 120px !important;
  }
}

.qr-footer {
  display: none;
}

.total-votos {
  text-align: right;
}

@media (max-width: 768px) {
  .grid.grid-header {
    grid-template-columns: 1fr;
  }
  .qr-container {
    margin-left: 0px;
  }
  .qr-footer {
    display: block;
    margin-top: 50px;
    margin-bottom: 50px;
  }
  .qr-header {
    display: none;
  }
}
</style>
