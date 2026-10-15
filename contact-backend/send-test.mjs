import { readConfig, sendContact } from "./mailgun.mjs";
const config = readConfig();
if (!config.ready) {
  console.error("Mailgun configuration is incomplete.");
  process.exitCode = 1;
} else {
  try {
    const messageId = await sendContact(
      {
        topic: "Tìm hiểu dự án",
        name: "SeeVia — kiểm tra kết nối",
        email: "",
        message:
          "Đây là email kiểm tra kết nối Mailgun của website SeeVia. Mailgun đã tiếp nhận thư này để chuyển tới địa chỉ email bạn chỉ định.",
      },
      config,
    );
    console.log(JSON.stringify({ accepted: true, messageId }));
  } catch (error) {
    console.error(
      JSON.stringify({
        accepted: false,
        code: error.message,
        network: error.cause?.code,
      }),
    );
    process.exitCode = 1;
  }
}
