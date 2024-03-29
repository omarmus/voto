<template>
  <div class="container">
    <div class="voto">
      <div class="alert alert-danger text-center" v-if="error">
        {{ error }}
      </div>
      <div class="alert alert-success text-center" v-if="success">
        {{ success }}
      </div>
      <div class="alert alert-warning text-center" v-if="warning">
        {{ warning }}
      </div>
      <h2 class="voto-title">{{ encuesta.number }}{{ encuesta.number ? '.' : '' }} {{ encuesta.pregunta }}</h2>
      <ul
        class="voto-preguntas"
        :class="{ disabled: !encuesta.active }">
        <li v-for="(item, index) in encuesta.respuestas" :key="item.id">
          <input
            type="radio" :id="'option-' + item.id"
            :value="item.id"
            v-model="respuesta"
            name="selector">
          <label :for="'option-' + item.id"><strong>{{ item.number }}.</strong> {{ item.texto }}</label>
          <div class="check"><div v-if="index" class="inside"></div></div>
        </li>
      </ul>
      <div class="voto-actions" v-if="Object.keys(encuesta).length">
        <button
          v-if="encuesta.active"
          type="button"
          :disabled="send"
          class="btn btn-primary"
          @click="enviar">Votar</button>
        <button
          v-else
          type="button"
          class="btn btn-info"
          @click="showTotal">Ver los resultados</button>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import encuesta from '../components/mixins/encuesta'

export default {
  mixins: [ encuesta ],
  data () {
    return {
      encuesta: {},
      respuesta: 0,
      key: null,
      error: null,
      success: null,
      warning: null,
      send: false,
      test: false
    }
  },
  mounted () {
    this.key = this.$route.params.key
    if (window.localStorage.getItem(`app-voto#${this.key}`)) {
      this.showTotal()
    } else {
      firebase.database().ref(`preguntas/${this.key}`)
        .on('value', snapshot => {
          let data = snapshot.val()
          if (data) {
            if (data.active) {
              this.success = 'La encuesta sigue abierta 😃'
              this.error = null
            } else {
              this.error = 'La encuesta ya se cerró 🙁'
              this.success = null
            }
            this.encuesta = this.convertEncuesta(this.key, data)
          } else {
            this.warning = 'No existe la encuesta 😅'
          }
        })
    }
  },
  methods: {
    showTotal () {
      this.$router.push(`/total/${this.key}`)
    },
    enviar () {
      if (localStorage.getItem(`app-voto#${this.key}`)) {
        this.warning = '¡Usted ya realizó su voto previamente! 😠'
        this.encuesta.active = false
        return false
      }
      if (!this.send) {
        if (this.respuesta) {
          if (!this.test) {
            this.send = true
          }
          this.error = null
          const instance = firebase.database().ref(`preguntas/${this.key}/respuestas/${this.respuesta}`)
          instance.once('value', snapshot => {
            let respuesta = snapshot.val()
            instance.update({
              total: parseInt(respuesta.total) + 1
            }, () => {
              if (!this.test) {
                this.success = '¡Gracias por su voto! 😃'
                localStorage.setItem(`app-voto#${this.key}`, true)
                this.showTotal()
              }
            })
          })
        } else {
          this.error = 'Seleccione una respuesta por favor 😕'
        }
      }
    }
  },
  watch: {
    respuesta (val) {
      if (val) {
        this.error = null
      }
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/_variables.scss';

$text: #777777;

.voto-title {
  margin-top: 30px;
  text-align: center;
}

.voto {
  padding-top: 20px;
}

.voto-actions {
  text-align: center;

  .btn {
    width: 100%;
    text-align: center;
    max-width: 600px;
    display: block;
    margin: 0 auto;
    line-height: 2rem;
    font-size: 1.2rem;
  }
}

.voto-preguntas {
  list-style: none;
  margin: 30px auto;
  padding: 0;
  max-width: 600px;
  position: relative;
  width: 100%;

  &.disabled {
    &::before {
      content: '';
      position: absolute;
      background-color: rgba(255, 255, 255, .6);
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
    }
  }

  li {
    color: $text;
    display: block;
    position: relative;
    width: 100%;
    border-bottom: 1px solid #cccccc;
    padding: 20px 0;

    &:last-child {
      border: none;
    }

    strong {
      font-weight: 800;
      color: $info;
    }

    input[type=radio]{
      position: absolute;
      visibility: hidden;
    }

    label{
      display: block;
      position: relative;
      font-weight: 300;
      font-size: 1.3em;
      padding-left: 80px;
      margin: 10px auto;
      line-height: 1.7rem;
      z-index: 9;
      cursor: pointer;
      -webkit-transition: all 0.25s linear;
    }

    &:hover label{
      color: $primary;
    }

    .check{
      display: block;
      position: absolute;
      border: 5px solid $text;
      border-radius: 100%;
      margin-top: -18px;
      height: 25px;
      width: 25px;
      top: 50%;
      left: 20px;
      z-index: 5;
      transition: border .25s linear;
      -webkit-transition: border .25s linear;
    }

    &:hover .check {
      border: 5px solid $primary;
    }

    .check::before {
      display: block;
      position: absolute;
      content: '';
      border-radius: 100%;
      height: 15px;
      width: 15px;
      top: 5px;
      left: 5px;
      margin: auto;
      transition: background 0.25s linear;
      -webkit-transition: background 0.25s linear;
    }
  }

  input[type=radio]:checked ~ .check {
    border: 5px solid $primary;
  }

  input[type=radio]:checked ~ .check::before{
    background: $primary;
  }

  input[type=radio]:checked ~ label{
    color: $primary;
  }
}
</style>
