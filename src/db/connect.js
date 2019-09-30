import mongoose from 'mongoose';
import config from 'config';

export default mongoose
  .connect(config.db.connectionSring, { useNewUrlParser: true })
  .catch(err => {
    console.error('Error connecting Database');
    console.error(err);
  });

//AIzaSyCF-fODILH2hwB84CCfGcFFEj1oHV9GIBU
