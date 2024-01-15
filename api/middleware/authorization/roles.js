const { AbilityBuilder, Ability } = require('@casl/ability');

const { ROLES } = require('@/utils');

const roles = {
  superuser: (can, cannot) => {
    can('manage', 'all'); // read-write access to everything
  },
  seller: (can, cannot) => {
    can('read', 'user');
    can('manage', 'proforma');
    can('manage', 'sale');

    can('read', 'family');
    can('read', 'subfamily');
    can('read', 'element');
    can('read', 'model');
    can('read', 'provider');
    can('read', 'product');
    can('read', 'productBox');
    can('read', 'warehouse');

    can('read', 'bank');
    can('manage', 'client');

    can('read', 'deliveryAgency');
    can('read', 'dispatch');
    can('manage', 'proforma');
    
  },
  logistic: (can, cannot) => {
    can('read', 'user');

    can('manage', 'family');
    can('manage', 'subfamily');
    can('manage', 'element');
    can('manage', 'model');
    can('manage', 'provider');
    can('manage', 'product');
    can('manage', 'productBox');
    can('manage', 'warehouse');

    can('manage', 'supply'); // ? Gestión y atención
    can('read', 'productBox');
    can('read', 'bank');
    can('read', 'client');

    can('read', 'deliveryAgency');
    can('manage', 'dispatch');
    can('read', 'proforma');
    can('read', 'sale');
  },
  manager: (can, cannot) => {
    can('read', 'user');

    can('read', 'family');
    can('read', 'subfamily');
    can('read', 'element');
    can('read', 'model');
    can('read', 'provider');
    can('read', 'product');
    can('read', 'productBox');
    can('read', 'warehouse');

    can('read', 'bank');
    can('manage', 'client');
    can('SIGO', 'client');

    can('read', 'deliveryAgency');
    can('read', 'dispatch');
    can('read', 'proforma');
    can('manage', 'sale');
  },
};

const defineAbilityFor = role => {
  const { can, cannot, rules } = new AbilityBuilder();
  roles[role](can, cannot);
  return new Ability(rules);
};

module.exports = { defineAbilityFor };
