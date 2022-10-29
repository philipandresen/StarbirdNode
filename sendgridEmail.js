import sgMail from '@sendgrid/mail';
import {log} from "./utils.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function notifyError(err) {
    const msg = {
        to: 'philip.andresen@gmail.com',
        cc: 'carina.masterman@starbirdmusic.com',
        from: 'pianos@starbirdmusic.com',
        replyTo: 'philip.andresen@gmail.com',
        subject: 'Backup Failure - TEST',
        text: `Error: ${err}`,
        html: `<strong>ERROR IN BACKUP PROCESS!</strong><br/><pre><code>${err}</code></pre>`,
    }
    log('Sending error notification email...');
    sgMail
        .send(msg)
        .then(() => {
            log(`Email sent to ${msg.to} with cc to: ${msg.cc}`);
        })
        .catch((error) => {
            log(error);
        })
}
