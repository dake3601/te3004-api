import { type Request, type Response, type NextFunction } from 'express';

interface Error {
  status?: number
  message?: string
}

const handleError = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
};

export { handleError };
