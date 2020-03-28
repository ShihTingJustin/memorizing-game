GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
}

// Symbols = ['黑桃', '愛心', '方塊', '梅花']
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg',
  'https://image.flaticon.com/icons/svg/105/105220.svg',
  'https://image.flaticon.com/icons/svg/105/105212.svg',
  'https://image.flaticon.com/icons/svg/105/105219.svg'
]

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return model.revealedCards[0].dataset.index % 13 === model.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

const view = {
  transformNumber(index) {
    const number = (index % 13) + 1
    switch (number) {
      case 1:
        return 'A'

      case 11:
        return 'J'

      case 12:
        return 'Q'

      case 13:
        return 'K'

      default:
        return number
    }
  },
  displayCards(indexs) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
  },
  getCardElement(index) {
    return `<div data-index='${index}' class='card back'></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },
  flipCards(...cards) {
    cards.map(card => {
      console.log(card)
      if (card.classList.contains('back')) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        //紅心方塊上色
        cards.forEach(card => {
          const img = card.getElementsByTagName('img')
          if (img[0].src === 'https://image.flaticon.com/icons/svg/105/105220.svg' || img[0].src === 'https://image.flaticon.com/icons/svg/105/105212.svg') {
            card.classList.add('red')
          }
        })
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    // textContent = innerText != innerHTML
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      },
        {
          once: true
          //讓監聽器觸發是一次性的 立即消失 避免影響瀏覽器效能
        }
      )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
  flipAllCards() {
    const allCards = document.querySelectorAll('.card')
    allCards.forEach(card => {
      card.classList.add('paired')
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      //紅心方塊上色
      const img = card.getElementsByTagName('img')
      if (img[0].src === 'https://image.flaticon.com/icons/svg/105/105220.svg' || img[0].src === 'https://image.flaticon.com/icons/svg/105/105212.svg') {
        card.classList.add('red')
      }
    })
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(model.triedTimes += 1)
        view.flipCards(card)
        model.revealedCards.push(card)

        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(controller.resetCards, 1000)
          //setTimeout第一個參數要放function本身 而非回傳值
        }
        break
    }
    console.log(`current state:`, this.currentState)
    console.log(`reveal cards`, model.revealedCards)
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  GodMode() {
    model.score = 260
    view.renderScore(model.score)
    view.flipAllCards()
    view.showGameFinished()
    controller.currentState = GAME_STATE.GameFinished
  },
  showNewGame() {
    model.score = 0
    model.triedTimes = 0
    view.renderScore(model.score)
    view.renderTriedTimes(model.triedTimes)
    const div = document.querySelector('.completed')
    if (controller.currentState === GAME_STATE.GameFinished) {
      div.remove()
    }
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  setNGandGM() {
    const godModeBtn = document.querySelector('#GM-btn')
    godModeBtn.addEventListener('click', () => controller.GodMode())

    const newBtn = document.querySelector('#New-btn')
    newBtn.addEventListener('click', () => {
      alert('Start New Game !!!')
      controller.showNewGame()
      controller.GameStart()
    })
  },
  GameStart() {
    controller.currentState = GAME_STATE.FirstCardAwaits
    controller.generateCards()
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        controller.dispatchCardAction(card)
      })
    })
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


controller.GameStart()
controller.setNGandGM()