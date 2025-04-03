document.addEventListener("DOMContentLoaded", function () {
    // Функция маски для телефонного номера по шаблону: +998 (XX) XXX-XX-XX
    function maskPhoneInput(inputElement) {
      if (!inputElement.value.startsWith("+998")) {
        inputElement.value = "+998 ";
      }
      inputElement.addEventListener("input", function () {
        let currentValue = inputElement.value;
        // Извлекаем только цифры
        let digits = currentValue.replace(/\D/g, '');
        
        // Если цифры начинаются с "998", удаляем их (код страны)
        if (digits.startsWith("998")) {
          digits = digits.substring(3);
        }
        // Ограничиваем до 9 цифр (формат: 2+3+2+2)
        digits = digits.substring(0, 9);
        
        // Формируем номер по шаблону
        let formatted = "+998 ";
        if (digits.length > 0) {
          formatted += "(" + digits.substring(0, Math.min(2, digits.length));
        }
        if (digits.length >= 2) {
          formatted += ") ";
        }
        if (digits.length > 2) {
          formatted += digits.substring(2, Math.min(5, digits.length));
        }
        if (digits.length >= 5) {
          formatted += "-";
        }
        if (digits.length > 5) {
          formatted += digits.substring(5, Math.min(7, digits.length));
        }
        if (digits.length >= 7) {
          formatted += "-";
        }
        if (digits.length > 7) {
          formatted += digits.substring(7, Math.min(9, digits.length));
        }
        
        inputElement.value = formatted;
      });
    }
  
    // Применяем маску к обоим полям телефона
    maskPhoneInput(document.getElementById("phone"));
    maskPhoneInput(document.getElementById("companyPhone"));
  
    // Элементы переключения типа клиента и секций формы
    const clientTypeRadios = document.getElementsByName("clientType");
    const physicalFields = document.getElementById("physicalFields");
    const legalFields = document.getElementById("legalFields");
  
    // Переключение между физическим и юридическим лицом
    clientTypeRadios.forEach(radio => {
      radio.addEventListener("change", function () {
        if (this.value === "Физическое лицо") {
          physicalFields.style.display = "block";
          legalFields.style.display = "none";
          toggleFields(physicalFields, true);
          toggleFields(legalFields, false);
        } else {
          physicalFields.style.display = "none";
          legalFields.style.display = "block";
          toggleFields(physicalFields, false);
          toggleFields(legalFields, true);
        }
      });
    });
  
    // Функция для активации/деактивации полей
    function toggleFields(section, enable) {
      section.querySelectorAll("input, select").forEach(input => {
        input.disabled = !enable;
        if (enable) {
          input.setAttribute("required", "true");
        } else {
          input.removeAttribute("required");
        }
      });
    }
  
    // Обработка отправки формы
    document.getElementById("orderForm").addEventListener("submit", function (event) {
      event.preventDefault();
  
      const token = "7483838324:AAFoTnHAbP1ynEDdLsweoi6BE8r0KN4yDdA"; // Токен бота
      const chatId = "-1002608270105"; // chat_id (без лишних пробелов)
      const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  
      const clientType = document.querySelector('input[name="clientType"]:checked').value;
      let message = generateMessage(clientType);
  
      // Для юридических лиц: если email не содержит "@", дописываем "@gmail.com"
      if (clientType === "Юридическое лицо") {
        const emailInput = document.getElementById("email");
        if (emailInput.value.indexOf("@") === -1) {
          emailInput.value += "@gmail.com";
          message = generateMessage(clientType); // пересобираем сообщение
        }
      }
  
      // Задержка 1 секунда перед отправкой
      setTimeout(() => {
        sendMessageToTelegram(apiUrl, chatId, message);
      }, 1000);
    });
  
    // Функция формирования текста сообщения
    function generateMessage(clientType) {
      let message = "Новая заявка на кондиционер Midea:\n\n";
      message += `Тип клиента: ${clientType}\n`;
  
      if (clientType === "Физическое лицо") {
        message += `ФИО: ${document.getElementById("fullName").value}\n`;
        message += `Телефон: ${document.getElementById("phone").value}\n`;
        message += `Город: ${document.getElementById("city").value}\n`;
      } else {
        message += `Компания: ${document.getElementById("companyName").value}\n`;
        message += `Телефон: ${document.getElementById("companyPhone").value}\n`;
        message += `Email: ${document.getElementById("email").value}\n`;
        message += `Город: ${document.getElementById("companyCity").value}\n`;
      }
  
      message += `Тип кондиционера: ${document.getElementById("airconType").value}\n`;
      message += `Установка: ${document.querySelector('input[name="installationPlace"]:checked').value}\n`;
      message += `Площадь: ${document.getElementById("area").value} м²\n`;
  
      return message;
    }
  
    // Функция отправки сообщения в Telegram через POST-запрос
    function sendMessageToTelegram(apiUrl, chatId, message) {
      const payload = {
        chat_id: chatId,
        text: message
      };
  
      console.log("Отправляем данные в Telegram:", payload);
  
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          console.log("Ответ от Telegram API:", data);
          if (data.ok) {
            alert("Заявка отправлена!");
            document.getElementById("orderForm").reset();
          } else {
            alert("Ошибка: " + data.description);
          }
        })
        .catch(error => {
          console.error("Ошибка соединения:", error);
          alert("Ошибка соединения с Telegram API");
        });
    }
  });
  