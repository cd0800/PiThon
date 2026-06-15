export function InputOTP({ length = 6 }) {
  return (
    <div className="ui-otp">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          className="ui-otp-input"
          maxLength={1}
          placeholder="-"
        />
      ))}
    </div>
  );
}
