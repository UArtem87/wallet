const count = document.querySelector('.count');
const analitList = document.querySelector('.analitics');
const error = document.querySelector('.error');
const input = document.querySelector('.input');
const btns = document.querySelector('.btn-box');
const list = document.querySelector('.history');
const clear = document.querySelector('.btn__clear');
const notification =
  document.querySelector('.notification');

input.focus();

let toastId = null;

const initWallet = () => {
  let currentCount = +localStorage.getItem('count') || 0;
  const history =
    JSON.parse(localStorage.getItem('history')) || [];

  return {
    get count() {
      return currentCount.toFixed(2);
    },

    add(val) {
      currentCount += val;
      this.saveCount();
    },

    sub(val) {
      currentCount -= val;
      this.saveCount();
    },

    saveCount() {
      localStorage.setItem(
        'count',
        JSON.stringify(currentCount),
      );
    },

    get history() {
      return [...history];
    },

    addHistory(item) {
      history.push(item);
      localStorage.setItem(
        'history',
        JSON.stringify(history),
      );
    },

    clear() {
      currentCount = 0;
      history.length = 0;
    },
  };
};

const wallet = initWallet();

const showCount = () => {
  count.textContent = `${wallet.count}$`;
};

showCount();

const analitics = ({ history }) => {
  let earned = 0;
  let spent = 0;

  history.forEach(({ value, isAdd }) => {
    isAdd ? (earned += value) : (spent += value);
  });

  analitList.textContent = `Заработано: ${earned.toFixed(2)}$ Потрачено: ${spent.toFixed(2)}$`;
};

analitics(wallet);

const showValue = (value, isAdd = false) => {
  const sum = document.createElement('li');
  sum.classList.add('sum');
  if (isAdd) {
    sum.textContent = `+${value}$`;
    sum.style.color = 'green';
  } else {
    sum.textContent = `-${value}$`;
    sum.style.color = 'red';
  }

  list.appendChild(sum);
};

wallet.history.forEach(({ value, isAdd }) => {
  showValue(value, isAdd);
});

const scrollToBottom = () => {
  list.scrollTo({
    top: list.scrollHeight,
    behavior: 'smooth',
  });
};

scrollToBottom();

const showToast = (type, text) => {
  clearTimeout(toastId);
  notification.classList.remove(
    'hidden',
    'error',
    'success',
  );

  if (type === 'success') {
    notification.classList.add('success');
    notification.textContent = text;
  }

  if (type === 'error') {
    notification.classList.add('error');
    notification.textContent = text;
  }
  toastId = setTimeout(() => {
    notification.classList.remove('success', 'error');
    notification.classList.add('hidden');
  }, 2000);
};

const getValue = () => {
  const normalValue = input.value.trim();
  if (
    normalValue === '' ||
    isNaN(Number(normalValue)) ||
    normalValue === '0'
  ) {
    showToast('error', 'Введите корректную сумму!');
    input.focus();
    return null;
  }

  return +normalValue;
};

const addMoney = (value, isAdd) => {
  wallet.add(value);
  showToast(
    'success',
    `Баланс успешно пополнен на ${value}$!`,
  );
  showCount();
  showValue(value, isAdd);
  wallet.addHistory({
    value,
    isAdd,
  });
  analitics(wallet);
  input.value = '';
  scrollToBottom();
};

const getMoney = (value) => {
  if (value > wallet.count) {
    showToast('error', 'Недостаточно средств!');
    input.focus();
  } else {
    wallet.sub(value);
    showToast('success', `Вы сняли ${value}$!`);
    showCount();
    showValue(value);
    wallet.addHistory({
      value,
      isAdd: false,
    });
    analitics(wallet);
    input.value = '';
    scrollToBottom();
  }
};

input.addEventListener('input', (e) => {
  const lastChar = e.target.value.at(-1);

  const regExp = /[\d.]/;

  if (input.value === '') {
    return;
  }

  if (!regExp.test(lastChar)) {
    showToast('error', 'Введите корректную сумму!');
  }
});

btns.addEventListener('click', (e) => {
  let isAdd = true;
  const currentValue = getValue();

  if (currentValue === null) {
    return;
  }

  if (e.target.classList.contains('btn')) {
    e.target.classList.contains('btn__in')
      ? addMoney(currentValue, isAdd)
      : getMoney(currentValue);
  }
});

clear.addEventListener('click', () => {
  localStorage.removeItem('count');
  localStorage.removeItem('history');
  wallet.clear();
  analitics(wallet);
  list.textContent = '';
  showCount();
});
