import { celebrate, Joi } from 'celebrate';
import { pagination, sorting } from '../schemas';

const addRequiredFields = (schema, requiredFeilds) => {
  requiredFeilds.forEach(field => {
    if (schema[field]) schema[field] = schema[field].concat(Joi.required());
  });
  return schema;
};

export function getCRUDValidators(schema, requiredFeilds) {
  const create = celebrate({
    body: addRequiredFields({ ...schema }, requiredFeilds)
  });

  const show = celebrate({
    params: {
      id: Joi.string().regex(/^[a-f\d]{24}$/i)
    }
  });

  const update = celebrate(
    {
      params: {
        id: Joi.string().regex(/^[a-f\d]{24}$/i)
      },
      body: schema
    },
    { context: { update: true } }
  );

  const destroy = celebrate({
    params: {
      id: Joi.string().regex(/^[a-f\d]{24}$/i)
    }
  });

  return {
    create,
    show,
    update,
    destroy
  };
}

export function mergeIndexValidator(query) {
  return celebrate({
    query: {
      ...pagination,
      ...sorting,
      ...query
    }
  });
}
