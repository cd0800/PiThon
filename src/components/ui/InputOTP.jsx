export function InputOTP({ length = 6 }) {
  const focusInput = (index, container) => {
    const input = container.querySelectorAll(".ui-otp-input")[index];
    input?.focus();
    input?.select();
  };

  const fillInputs = (inputs, startIndex, value) => {
    const digits = value.replace(/\D/g, "").slice(0, inputs.length - startIndex);

    digits.split("").forEach((digit, offset) => {
      inputs[startIndex + offset].value = digit;
    });

    return digits.length;
  };

  const handleChange = (event, index) => {
    const container = event.currentTarget.closest(".ui-otp");
    const inputs = Array.from(container.querySelectorAll(".ui-otp-input"));
    const digitsAdded = fillInputs(inputs, index, event.currentTarget.value);

    if (!digitsAdded) {
      event.currentTarget.value = "";
      return;
    }

    const nextIndex = Math.min(index + digitsAdded, inputs.length - 1);
    focusInput(nextIndex, container);
  };

  const handleKeyDown = (event, index) => {
    const container = event.currentTarget.closest(".ui-otp");

    if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
      event.preventDefault();
      focusInput(index - 1, container);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1, container);
      return;
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusInput(index + 1, container);
    }
  };

  const handlePaste = (event, index) => {
    event.preventDefault();
    const container = event.currentTarget.closest(".ui-otp");
    const inputs = Array.from(container.querySelectorAll(".ui-otp-input"));
    const digitsAdded = fillInputs(
      inputs,
      index,
      event.clipboardData.getData("text")
    );

    if (digitsAdded) {
      focusInput(Math.min(index + digitsAdded, inputs.length - 1), container);
    }
  };

  return (
    <div className="ui-otp">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          aria-label={`Verification digit ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className="ui-otp-input"
          inputMode="numeric"
          maxLength={1}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={(event) => handlePaste(event, index)}
          pattern="[0-9]*"
          placeholder="-"
        />
      ))}
    </div>
  );
}
